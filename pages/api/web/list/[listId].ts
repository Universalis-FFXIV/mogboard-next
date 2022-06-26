import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { acquireConn, releaseConn } from '../../../../db/connect';
import * as db from '../../../../db/user-list';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} not allowed`);
    return;
  }

  const session = await getServerSession({ req, res }, authOptions);
  const { listId } = req.query;
  const { name, items } = req.body;

  if (!session || !session.user.id) {
    res.status(401).json({ message: 'You must be logged in to perform this action.' });
    return;
  }

  if (typeof listId !== 'string') {
    res.status(400).json({ message: 'Invalid list provided.' });
    return;
  }

  if (name != null && (typeof name !== 'string' || name.length < 3)) {
    res.status(400).json({ message: 'Invalid list name.' });
    return;
  }

  if (items != null && (!Array.isArray(items) || items.some((item) => typeof item !== 'number'))) {
    res.status(400).json({ message: 'Invalid list items.' });
    return;
  }

  const conn = await acquireConn();
  try {
    const ownerId = await db.getUserListOwnerId(listId, conn);
    if (ownerId !== session.user.id) {
      res.status(403).json({ message: 'You are not authorized to perform this action.' });
      return;
    }

    if (name != null) {
      await db.updateUserListName(session.user.id, listId, name, conn);
    }

    if (items != null) {
      await db.updateUserListItems(session.user.id, listId, items, conn);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unknown error' });
    return;
  } finally {
    await releaseConn(conn);
  }

  return res.json({
    message: 'Success',
  });
}
