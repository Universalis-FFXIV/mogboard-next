import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { acquireConn, releaseConn } from '../../../../db/connect';
import { PHPObject } from '../../../../db/PHPObject';
import * as db from '../../../../db/user-list';
import { authOptions } from '../../auth/[...nextauth]';

async function put(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { listId } = req.query;
  const { name, items } = req.body;

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  if (typeof listId !== 'string') {
    return res.status(400).json({ message: 'Invalid list provided.' });
  }

  if (name != null && (typeof name !== 'string' || name.length < 3)) {
    return res.status(400).json({ message: 'Invalid list name.' });
  }

  if (
    items != null &&
    (!Array.isArray(items) || items.some((item: any) => typeof item !== 'number'))
  ) {
    return res.status(400).json({ message: 'Invalid list items.' });
  }

  if (items != null && items.length > db.USER_LIST_MAX_ITEMS) {
    return res.status(441).json({ message: 'List is at maximum capacity.' });
  }

  const itemsProcessed = Array.isArray(items) ? new PHPObject() : null;
  itemsProcessed?.push(...items);

  const conn = await acquireConn();
  try {
    const ownerId = await db.getUserListOwnerId(listId, conn);
    if (ownerId == null) {
      return res.status(404).json({ message: 'The requested list does not exist.' });
    }

    if (ownerId !== session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    if (name != null) {
      await db.updateUserListName(session.user.id, listId, name, conn);
    }

    if (itemsProcessed != null) {
      await db.updateUserListItems(session.user.id, listId, itemsProcessed, conn);
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

async function del(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { listId } = req.query;

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  if (typeof listId !== 'string') {
    return res.status(400).json({ message: 'Invalid list provided.' });
  }

  const conn = await acquireConn();
  try {
    const list = await db.getUserList(listId, conn);
    if (list == null) {
      return res.status(404).json({ message: 'The requested list does not exist.' });
    }

    if (list.custom) {
      return res.status(440).json({ message: 'You may not delete special lists.' });
    }

    const ownerId = list.userId;
    if (ownerId !== session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    await db.deleteUserList(session.user.id, listId, conn);
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
  } else if (req.method === 'DELETE') {
    return await del(req, res);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
