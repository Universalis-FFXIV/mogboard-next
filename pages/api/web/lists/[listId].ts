import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { getItem } from '../../../../data/game';
import { acquireConn, releaseConn } from '../../../../db/connect';
import * as db from '../../../../db/user-list';
import { authOptions } from '../../auth/[...nextauth]';

type ToggleItem = { action: 'add'; itemId: number } | { action: 'remove'; itemId: number };

async function put(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { listId } = req.query;
  const { name, item } = req.body;

  if (!session || !session.user.id) {
    return res.status(401).json({ message: 'You must be logged in to perform this action.' });
  }

  if (typeof listId !== 'string') {
    return res.status(400).json({ message: 'Invalid list provided.' });
  }

  if (name != null && (typeof name !== 'string' || name.length < 3)) {
    return res.status(400).json({ message: 'Invalid list name.' });
  }

  let itemUpdate: ToggleItem | null = null;
  if (Object.hasOwn(item, 'action') && Object.hasOwn(item, 'itemId')) {
    if (item.action !== 'add' && item.action !== 'remove') {
      return res.status(400).json({ message: 'Invalid item update format.' });
    }

    if (typeof item.itemId !== 'number' || !getItem(item.itemId, 'en')) {
      return res.status(400).json({ message: 'Invalid item ID.' });
    }

    itemUpdate = { action: item.action, itemId: item.itemId };
  }

  const conn = await acquireConn();
  try {
    const list = await db.getUserList(listId, conn);
    if (list == null) {
      return res.status(404).json({ message: 'The requested list does not exist.' });
    }

    if (list.userId !== session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    if (name != null) {
      await db.updateUserListName(session.user.id, listId, name, conn);
    }

    if (itemUpdate != null) {
      if (itemUpdate.action === 'add' && !list.items.includes(itemUpdate.itemId)) {
        list.items.unshift(itemUpdate.itemId);

        if (list.items.length > db.USER_LIST_MAX_ITEMS) {
          return res.status(441).json({ message: 'List is at maximum capacity.' });
        }

        await db.updateUserListItems(session.user.id, listId, list.items, conn);
      } else if (itemUpdate.action === 'remove' && list.items.includes(itemUpdate.itemId)) {
        list.items.splice(list.items.indexOf(itemUpdate.itemId), 1);

        await db.updateUserListItems(session.user.id, listId, list.items, conn);
      }
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
