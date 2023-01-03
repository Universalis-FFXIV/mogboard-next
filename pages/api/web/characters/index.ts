import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '../../../../db';
import { authOptions } from '../../auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import { createHandler, Get, Req, Res } from 'next-api-decorators';
import { UserCharacter } from '../../../../types/universalis/user';

class CharactersHandler {
  @Get()
  async getCharacters(@Req() req: NextApiRequest, @Res() res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }

    // Fetch the user's characters
    const characters: UserCharacter[] = [];
    try {
      const userCharacters = await Database.getUserCharacters(session.user.id);
      characters.push(...userCharacters);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred.' });
    }

    return res.json(characters);
  }
}

export default createHandler(CharactersHandler);
