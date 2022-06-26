import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { acquireConn, releaseConn } from '../../../../db/connect';
import * as db from '../../../../db/user-list';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  const session = await getServerSession({ req, res }, authOptions);
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

  if (items != null && (!Array.isArray(items) || items.some((item) => typeof item !== 'number'))) {
    return res.status(400).json({ message: 'Invalid list items.' });
  }

  const conn = await acquireConn();
  try {
    const ownerId = await db.getUserListOwnerId(listId, conn);
    if (ownerId !== session.user.id) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    if (name != null) {
      await db.updateUserListName(session.user.id, listId, name, conn);
    }

    if (items != null) {
      await db.updateUserListItems(session.user.id, listId, items, conn);
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
