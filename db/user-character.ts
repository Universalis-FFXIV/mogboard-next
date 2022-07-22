import { UserCharacter } from '../types/universalis/user';
import mariadb from 'mariadb';
import { createHash } from 'crypto';
import { unix } from './util';

export function getUserAuthCode(userId: string): string {
  return 'MB' + createHash('sha1').update(userId).digest('hex').substring(0, 5).toUpperCase();
}

export function linkUserCharacter(
  userId: string,
  characterId: string,
  characterName: string,
  characterServer: string,
  conn: mariadb.Connection
) {
  return conn.execute(
    'UPDATE users_characters SET user_id = ?, updated = ?, name = ?, server = ? WHERE id = ?',
    [userId, unix(), characterName, characterServer, characterId]
  );
}

export function unlinkUserCharacter(userId: string, characterId: string, conn: mariadb.Connection) {
  return conn.execute(
    'UPDATE users_characters SET user_id = NULL, updated = ?, main = FALSE WHERE id = ? AND user_id = ?',
    [unix(), characterId, userId]
  );
}

export function updateMainUserCharacter(
  userId: string,
  characterId: string,
  main: boolean,
  conn: mariadb.Connection
) {
  return conn.execute(
    'UPDATE users_characters SET main = ?, updated = ? WHERE id = ? AND user_id = ?',
    [main, unix(), characterId, userId]
  );
}

export function createUserCharacter(character: UserCharacter, conn: mariadb.Connection) {
  return conn.execute(
    'INSERT INTO users_characters (id, user_id, lodestone_id, name, server, avatar, main, confirmed, updated) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      character.id,
      character.userId,
      character.lodestoneId,
      character.name,
      character.server,
      character.avatar,
      character.main,
      character.confirmed,
      character.updated,
    ]
  );
}

export async function getUserCharacters(
  userId: string,
  conn: mariadb.Connection
): Promise<UserCharacter[]> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, lodestone_id, name, server, avatar, main, confirmed, updated FROM users_characters WHERE user_id = ?',
    [userId]
  );
  return rows.map(rowToUserCharacter);
}

export async function getUserCharacter(
  characterId: string,
  conn: mariadb.Connection
): Promise<UserCharacter | null> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, lodestone_id, name, server, avatar, main, confirmed, updated FROM users_characters WHERE id = ?',
    [characterId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rowToUserCharacter(rows[0]);
}

export async function getUserCharacterByLodestoneId(
  lodestoneId: number,
  conn: mariadb.Connection
): Promise<UserCharacter | null> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, lodestone_id, name, server, avatar, main, confirmed, updated FROM users_characters WHERE lodestone_id = ?',
    [lodestoneId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rowToUserCharacter(rows[0]);
}

function rowToUserCharacter(row: Record<string, any>): UserCharacter {
  return {
    id: row['id'],
    userId: row['user_id'],
    lodestoneId: row['lodestone_id'],
    name: row['name'],
    server: row['server'],
    avatar: row['avatar'],
    main: row['main'],
    confirmed: row['confirmed'],
    updated: row['updated'],
  };
}
