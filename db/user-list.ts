import { UserList } from '../types/universalis/user';
import mariadb from 'mariadb';
import { DoctrineArray } from './DoctrineArray';

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
