import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { acquireConn, releaseConn } from '../../../../db/connect';
import { PHPArray } from '../../../../db/PHPArray';
import * as db from '../../../../db/user-list';
import { unix } from '../../../../db/util';
import { UserListCustomType } from '../../../../types/universalis/user';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';

async function put(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  const itemsBody = req.body.items;

  if (
    itemsBody == null ||
    !Array.isArray(itemsBody) ||
    itemsBody.some((item: any) => typeof item !== 'number')
  ) {
    return res.status(400).json({ message: 'Invalid list items.' });
  }

  if (itemsBody.length > db.USER_LIST_MAX_ITEMS) {
    return res
      .status(441)
      .json({ message: 'List is at maximum capacity; please remove some items first.' });
  }

  const items = new PHPArray();
  items.push(...itemsBody);

  const conn = await acquireConn();
  try {
    const faves = await db.getUserListCustom(session.user.id, UserListCustomType.Favourites, conn);

    if (faves == null) {
      await db.createUserList(db.FavouritesList(uuidv4(), session.user.id, items), conn);
    } else {
      await db.updateUserListItems(session.user.id, faves.id, items, conn);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error' });
  } finally {
    await releaseConn(conn);
  }

  return res.json({
    message: 'Success',
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    return await put(req, res);
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
