import { UserList } from '../types/universalis/user';
import mariadb from 'mariadb';
import { DoctrineArray } from './DoctrineArray';

export async function getUserListOwnerId(
  listId: string,
  conn: mariadb.Connection
): Promise<string | null> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT user_id FROM users_lists WHERE id = ?',
    [listId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0]['user_id'];
}

export async function getUserList(
  listId: string,
  conn: mariadb.Connection
): Promise<UserList | null> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, added, updated, name, custom, custom_type, items FROM users_lists WHERE id = ?',
    [listId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rowToUserList(rows[0]);
}

export function updateUserListName(
  userId: string,
  listId: string,
  name: string,
  conn: mariadb.Connection
) {
  return conn.execute('UPDATE users_lists SET name = ? WHERE id = ? AND user_id = ?', [
    name,
    listId,
    userId,
  ]);
}

export function updateUserListItems(
  userId: string,
  listId: string,
  items: number[],
  conn: mariadb.Connection
) {
  return conn.execute('UPDATE users_lists SET items = ? WHERE id = ? AND user_id = ?', [
    new DoctrineArray(...items).serialize(),
    listId,
    userId,
  ]);
}

export async function getUserLists(userId: string, conn: mariadb.Connection): Promise<UserList[]> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, added, updated, name, custom, custom_type, items FROM users_lists WHERE user_id = ?',
    [userId]
  );
  return rows.map(rowToUserList);
}

function rowToUserList(row: Record<string, any>): UserList {
  return {
    id: row['id'],
    userId: row['user_id'],
    added: row['added'],
    updated: row['updated'],
    name: row['name'],
    custom: row['custom'],
    customType: row['custom_type'],
    items: DoctrineArray.deserialize(row['items']),
  };
}
