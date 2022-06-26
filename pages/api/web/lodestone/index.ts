import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getCharacter, LodestoneCharacter, searchCharacter } from '../../../../data/lodestone';
import { acquireConn, releaseConn } from '../../../../db/connect';
import {
  createUserCharacter,
  getUserAuthCode,
  getUserCharacters,
} from '../../../../db/user-character';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import { unix } from '../../../../db/util';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
    return;
  }

  const session = await getServerSession({ req, res }, authOptions);
  const { world, name, id } = req.body;

  if (!session || !session.user.id) {
    res.status(401).json({ message: 'You must be logged in to perform this action.' });
    return;
  }

  let character: LodestoneCharacter;
  let lodestoneId: number;
  if (typeof id === 'number') {
    lodestoneId = id;
    try {
      character = await getCharacter(id);
    } catch (err) {
      console.error(err);
      return res.status(404).json({ message: 'Failed to find character.' });
    }
  } else if (typeof world === 'string' && typeof name === 'string') {
    try {
      lodestoneId = await searchCharacter(world, name);
      character = await getCharacter(lodestoneId);
    } catch (err) {
      console.error(err);
      return res.status(404).json({ message: 'Failed to find character.' });
    }
  } else {
    return res.status(400).json({ message: 'No valid parameter set provided.' });
  }

  const authCode = getUserAuthCode(session.user.id);
  if (!character.bio.includes(authCode)) {
    return res.status(403).json({ message: 'Auth code not found in character bio.' });
  }

  const conn = await acquireConn();
  try {
    const userCharacters = await getUserCharacters(session.user.id, conn);
    if (userCharacters.map((c) => c.lodestoneId).includes(lodestoneId)) {
      return res.status(440).json({ message: 'User has already linked the requested character.' });
    }

    await createUserCharacter(
      {
        id: uuidv4(),
        userId: session.user.id,
        lodestoneId,
        name: character.name,
        server: character.world,
        avatar: character.avatar,
        main: userCharacters.length === 0,
        confirmed: true,
        updated: unix(),
      },
      conn
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await releaseConn(conn);
  }

  return res.status(200).json({ message: 'ok' });
}
