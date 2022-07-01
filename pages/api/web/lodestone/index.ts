import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getCharacter, LodestoneCharacter, searchCharacter } from '../../../../data/lodestone';
import { acquireConn, releaseConn } from '../../../../db/connect';
import {
  createUserCharacter,
  getUserAuthCode,
  getUserCharacter,
  getUserCharacterByLodestoneId,
  getUserCharacters,
  linkUserCharacter,
  unlinkUserCharacter,
  updateMainUserCharacter,
} from '../../../../db/user-character';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { unix } from '../../../../db/util';
import { UserCharacter } from '../../../../types/universalis/user';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);
  const { world, name, lodestoneId } = req.body;

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  let character: LodestoneCharacter;
  let lId: number;
  if (typeof lodestoneId === 'number') {
    lId = lodestoneId;
    try {
      character = await getCharacter(lId);
    } catch (err) {
      console.error(err);
      return res.status(404).json({
        message:
          'Could not find your character on Lodestone, try entering the Lodestone URL for your character.',
      });
    }
  } else if (typeof world === 'string' && typeof name === 'string') {
    try {
      lId = await searchCharacter(world, name);
      character = await getCharacter(lId);
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

  const authCode = getUserAuthCode(session.user.id);
  if (!character.bio.includes(authCode)) {
    return res.status(403).json({ message: 'Auth code not found in character bio.' });
  }

  let userCharacter: Partial<UserCharacter>;
  const conn = await acquireConn();
  try {
    const userCharacters = await getUserCharacters(session.user.id, conn);
    const initialCharacterCount = userCharacters.length;
    if (userCharacters.map((c) => c.lodestoneId).includes(lId)) {
      return res.status(440).json({ message: 'User has already linked the requested character.' });
    }

    let finalId: string;
    const existing = await getUserCharacterByLodestoneId(lId, conn);
    if (existing != null) {
      if (existing.userId != null) {
        return res.status(403).json({ message: 'Character is linked to a different user.' });
      } else {
        finalId = existing.id;
        await linkUserCharacter(session.user.id, existing.id, conn);
        userCharacter = existing;
        delete userCharacter.id;
        delete userCharacter.userId;
      }
    } else {
      finalId = uuidv4();
      const data = {
        lodestoneId: lId,
        name: character.name,
        server: character.world,
        avatar: character.avatar,
        main: false,
        confirmed: true,
        updated: unix(),
      };
      await createUserCharacter({ ...data, ...{ id: finalId, userId: session.user.id } }, conn);
      userCharacter = data;
    }

    if (initialCharacterCount === 0) {
      await updateMainUserCharacter(session.user.id, finalId, true, conn);
      userCharacter.main = true;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await releaseConn(conn);
  }

  return res.json(userCharacter);
}

async function put(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);
  const { lodestoneId, main } = req.body;

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  if (typeof lodestoneId !== 'number') {
    return res.status(400).json({ message: 'Invalid character ID.' });
  }

  if (typeof main === 'boolean') {
    const conn = await acquireConn();
    try {
      const target = await getUserCharacterByLodestoneId(lodestoneId, conn);
      if (target == null) {
        return res.status(404).json({ message: 'Character not found.' });
      }

      if (main) {
        const characters = await getUserCharacters(session.user.id, conn);
        for (const c of characters) {
          if (c.main) {
            await updateMainUserCharacter(session.user.id, c.id, false, conn);
          }
        }

        await updateMainUserCharacter(session.user.id, target.id, true, conn);
      } else {
        await updateMainUserCharacter(session.user.id, target.id, false, conn);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Unknown error' });
    } finally {
      await releaseConn(conn);
    }
  }

  return res.json({ message: 'Success' });
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);
  const { lodestoneId } = req.body;

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  if (typeof lodestoneId !== 'number') {
    return res.status(400).json({ message: 'Invalid character ID.' });
  }

  let newMain: number | null = null;
  const conn = await acquireConn();
  try {
    const target = await getUserCharacterByLodestoneId(lodestoneId, conn);
    if (target == null) {
      return res.status(404).json({ message: 'Character not found.' });
    }

    await unlinkUserCharacter(session.user.id, target.id, conn);

    if (target.main) {
      const characters = (await getUserCharacters(session.user.id, conn)).filter(
        (c) => c.id !== target.id
      );
      if (characters.length > 0) {
        newMain = characters[0].lodestoneId;
        await updateMainUserCharacter(session.user.id, characters[0].id, true, conn);
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error' });
  } finally {
    await releaseConn(conn);
  }

  return res.json({ main: newMain });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await post(req, res);
  } else if (req.method === 'PUT') {
    return await put(req, res);
  } else if (req.method === 'DELETE') {
    return await del(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
