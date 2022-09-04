import { UserList, UserListCustomType } from '../types/universalis/user';
import mariadb from 'mariadb';
import { PHPObject } from './PHPObject';
import { unix } from './util';

export const USER_LIST_MAX_ITEMS = 100;
export const USER_LIST_MAX = 12;

export const RecentlyViewedList = (id: string, userId: string, items: PHPObject): UserList => {
  return {
    id,
    userId,
    added: unix(),
    updated: unix(),
    name: 'Recently Viewed',
    custom: true,
    customType: UserListCustomType.RecentlyViewed,
    items,
  };
};

export const FavouritesList = (id: string, userId: string, items: PHPObject): UserList => {
  return {
    id,
    userId,
    added: unix(),
    updated: unix(),
    name: 'Favourites',
    custom: true,
    customType: UserListCustomType.Favourites,
    items,
  };
};

export function createUserList(list: UserList, conn: mariadb.Connection) {
  return conn.execute(
    'INSERT INTO users_lists (id, user_id, added, updated, name, custom, custom_type, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      list.id,
      list.userId,
      list.added,
      list.updated,
      list.name,
      list.custom,
      list.customType,
      list.items.serialize(),
    ]
  );
}

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

export async function getUserListCustom(
  userId: string,
  customType: Exclude<UserListCustomType, UserListCustomType.Default>,
  conn: mariadb.Connection
): Promise<UserList | null> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, added, updated, name, custom, custom_type, items FROM users_lists WHERE user_id = ? AND custom AND custom_type = ?',
    [userId, customType]
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
  return conn.execute('UPDATE users_lists SET name = ?, updated = ? WHERE id = ? AND user_id = ?', [
    name,
    unix(),
    listId,
    userId,
  ]);
}

export function updateUserListItems(
  userId: string,
  listId: string,
  items: PHPObject,
  conn: mariadb.Connection
) {
  return conn.execute(
    'UPDATE users_lists SET items = ?, updated = ? WHERE id = ? AND user_id = ?',
    [items.serialize(), unix(), listId, userId]
  );
}

export async function getUserLists(userId: string, conn: mariadb.Connection): Promise<UserList[]> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, added, updated, name, custom, custom_type, items FROM users_lists WHERE user_id = ?',
    [userId]
  );
  return rows.map(rowToUserList);
}

export function deleteUserList(userId: string, listId: string, conn: mariadb.Connection) {
  return conn.execute('DELETE FROM users_lists WHERE id = ? AND user_id = ?', [listId, userId]);
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
    items: PHPObject.fromArray(
      PHPObject.deserialize(row['items'], { allowDirtyArrays: true }).filter(
        (x) => !isNaN(parseInt(x))
      )
    ),
  };
}
