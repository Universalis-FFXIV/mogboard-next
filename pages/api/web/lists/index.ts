import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { acquireConn, releaseConn } from '../../../../db/connect';
import { DoctrineArray } from '../../../../db/DoctrineArray';
import { unix } from '../../../../db/util';
import { UserList, UserListCustomType } from '../../../../types/universalis/user';
import { authOptions } from '../../auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserLists,
  USER_LIST_MAX,
  USER_LIST_MAX_ITEMS,
  createUserList,
} from '../../../../db/user-list';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  const conn = await acquireConn();
  try {
    const lists = await getUserLists(session.user.id, conn);
    if (lists.length >= USER_LIST_MAX) {
      return res.status(400).json({ message: 'Maximum number of lists has been created.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error' });
  }

  const nameBody = req.body.name;
  if (typeof nameBody !== 'string') {
    return res.status(400).json({ message: 'Invalid name provided.' });
  }
  const name = nameBody;

  const items = new DoctrineArray();
  const itemsBody: unknown = req.body.items;
  if (
    !Array.isArray(itemsBody) ||
    itemsBody.some((item) => typeof item !== 'number') ||
    itemsBody.length > USER_LIST_MAX_ITEMS
  ) {
    return res.status(400).json({ message: 'Invalid items provided.' });
  }
  items.push(...itemsBody);

  const list: UserList = {
    id: uuidv4(),
    userId: session.user.id,
    added: unix(),
    updated: unix(),
    name,
    custom: false,
    customType: UserListCustomType.Default,
    items,
  };

  try {
    await createUserList(list, conn);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error' });
  } finally {
    await releaseConn(conn);
  }

  return res.json(list);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await post(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
