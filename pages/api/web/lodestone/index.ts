import type { NextApiRequest, NextApiResponse } from 'next';
import { getCharacter, LodestoneCharacter, searchCharacter } from '../../../../service/lodestone';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { unix } from '../../../../db/util';
import { UserCharacter } from '../../../../types/universalis/user';
import { unstable_getServerSession } from 'next-auth';
import {
  Body,
  createHandler,
  Delete,
  Post,
  Put,
  Req,
  Res,
  ValidationPipe,
} from 'next-api-decorators';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  MaxLength,
  MinLength,
  validateOrReject,
} from 'class-validator';

function toDbCharacter(
  lodestoneId: number,
  character: LodestoneCharacter
): Omit<UserCharacter, 'id' | 'userId'> & Partial<Pick<UserCharacter, 'id' | 'userId'>> {
  return {
    lodestoneId,
    name: character.name,
    server: character.world,
    avatar: character.avatar,
    main: false,
    confirmed: true,
    updated: unix(),
  };
}

class ClaimCharacterByIdDTO {
  @IsInt()
  lodestoneId!: number;
}

class ClaimCharacterByNameDTO {
  @MinLength(2)
  @MaxLength(32)
  world!: string;

  @MinLength(3)
  @MaxLength(32)
  name!: string;
}

class UpdateClaimDTO {
  @IsInt()
  lodestoneId!: number;

  @IsOptional()
  @IsBoolean()
  main?: boolean;
}

class DeleteClaimDTO {
  @IsInt()
  lodestoneId!: number;
}

class LodestoneHandler {
  @Post()
  async claimCharacter(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { world, name, lodestoneId } = req.body;

    // Get the character's Lodestone ID
    let lId: number;
    try {
      if (lodestoneId) {
        // It was provided directly
        const byId = new ClaimCharacterByIdDTO();
        byId.lodestoneId = lodestoneId;
        await validateOrReject(byId);
        lId = lodestoneId;
      } else if (world && name) {
        // It needs to be fetched from the server
        const byName = new ClaimCharacterByNameDTO();
        byName.world = world;
        byName.name = name;
        await validateOrReject(byName);

        try {
          const worldClean = world.replaceAll(/[^\w]/g, '');
          const nameClean = name.replaceAll(/[^\w\s]/g, '');
          lId = await searchCharacter(worldClean, nameClean);
        } catch (err) {
          console.error(err);
          return res.status(404).json({
            message:
              'Could not find your character on Lodestone, try entering the Lodestone URL for your character.',
          });
        }
      } else {
        return res.status(400).json({ message: 'No valid parameter set provided.' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'An error occurred.',
      });
    }

    // Fetch the full character data from the Lodestone
    let character: LodestoneCharacter;
    try {
      character = await getCharacter(lId);
    } catch (err) {
      console.error(err);
      return res.status(404).json({
        message:
          'Could not find your character on Lodestone, try entering the Lodestone URL for your character.',
      });
    }

    // Validate the character's authentication code
    const authCode = Database.getUserAuthCode(session.user.id);
    if (!character.bio.includes(authCode)) {
      return res.status(403).json({ message: 'Auth code not found in character bio.' });
    }

    // Attempt to save the character
    let userCharacter: Partial<UserCharacter>;
    try {
      const userCharacters = await Database.getUserCharacters(session.user.id);
      const initialCharacterCount = userCharacters.length;
      if (userCharacters.map((c) => c.lodestoneId).includes(lId)) {
        return res
          .status(440)
          .json({ message: 'User has already linked the requested character.' });
      }

      let finalId: string;
      const existing = await Database.getUserCharacterByLodestoneId(lId);
      if (existing != null) {
        if (existing.userId != null) {
          return res.status(403).json({ message: 'Character is linked to a different user.' });
        } else {
          finalId = existing.id;
          await Database.linkUserCharacter(
            session.user.id,
            existing.id,
            character.name,
            character.world
          );
          userCharacter = existing;
          delete userCharacter.id;
          delete userCharacter.userId;
        }
      } else {
        finalId = uuidv4();
        const data = toDbCharacter(lId, character);
        await Database.createUserCharacter({
          ...data,
          ...{ id: finalId, userId: session.user.id },
        });
        userCharacter = data;
      }

      // Users with only 1 character should have that set as their main
      if (initialCharacterCount === 0) {
        await Database.updateMainUserCharacter(session.user.id, finalId, true);
        userCharacter.main = true;
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json(userCharacter);
  }

  @Put()
  async updateClaim(
    @Body(ValidationPipe) body: UpdateClaimDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { lodestoneId, main } = body;

    // main == null means the user isn't updating this field at all
    if (main != null) {
      try {
        const target = await Database.getUserCharacterByLodestoneId(lodestoneId);
        if (target == null) {
          return res.status(404).json({ message: 'Character not found.' });
        }

        if (main) {
          // Unset all other characters as their main, then set the requested
          // character as their main
          const characters = await Database.getUserCharacters(session.user.id);
          for (const c of characters) {
            if (c.main) {
              await Database.updateMainUserCharacter(session.user.id, c.id, false);
            }
          }

          await Database.updateMainUserCharacter(session.user.id, target.id, true);
        } else {
          // Unset this character as their main
          await Database.updateMainUserCharacter(session.user.id, target.id, false);
        }
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred.' });
      }
    }

    return res.json({ message: 'Success' });
  }

  @Delete()
  async deleteClaim(
    @Body(ValidationPipe) body: DeleteClaimDTO,
    @Req() req: NextApiRequest,
    @Res() res: NextApiResponse
  ) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    const { lodestoneId } = body;

    let newMain: number | null = null;
    try {
      const target = await Database.getUserCharacterByLodestoneId(lodestoneId);
      if (target == null) {
        return res.status(404).json({ message: 'Character not found.' });
      }

      await Database.unlinkUserCharacter(session.user.id, target.id);

      if (target.main) {
        // Try to set their next character as their main
        const characters = (await Database.getUserCharacters(session.user.id)).filter(
          (c) => c.id !== target.id
        );
        if (characters.length > 0) {
          newMain = characters[0].lodestoneId;
          await Database.updateMainUserCharacter(session.user.id, characters[0].id, true);
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Unknown error' });
    }

    return res.json({ main: newMain });
  }
}

export default createHandler(LodestoneHandler);
