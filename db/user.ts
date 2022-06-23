import mariadb from 'mariadb';
import { User } from '../types/universalis/user';

export function createUser(user: User, conn: mariadb.Connection) {
  return conn.execute(
    'INSERT INTO users (id, added, last_online, is_banned, notes, sso, username, email, avatar, patron, patron_benefit_user, permissions, admin, alerts_max, alerts_expiry, alerts_update, sso_discord_id, sso_discord_avatar, sso_discord_token_expires, sso_discord_token_access, sso_discord_token_refresh, api_public_key, api_analytics_key, api_rate_limit) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      user.id,
      user.added,
      user.lastOnline,
      user.isBanned,
      user.notes ?? null,
      user.sso,
      user.username,
      user.email,
      user.avatar ?? null,
      user.patron,
      user.patronBenefitUser ?? null,
      user.permissions ?? null,
      user.admin,
      user.alertsMax,
      user.alertsExpiry,
      user.alertsUpdate,
      user.ssoDiscordId ?? null,
      user.ssoDiscordAvatar ?? null,
      user.ssoDiscordTokenExpires ?? null,
      user.ssoDiscordTokenAccess ?? null,
      user.ssoDiscordTokenRefresh ?? null,
      user.apiPublicKey ?? null,
      user.apiAnalyticsKey ?? null,
      user.apiRateLimit ?? null,
    ]
  );
}

export function updateUserBasic(
  id: string,
  username: string,
  email: string,
  avatar: string,
  conn: mariadb.Connection
) {
  return conn.execute('UPDATE users SET username = ?, email = ?, avatar = ? WHERE id = ?', [
    username,
    email,
    avatar,
    id,
  ]);
}

export function updateUserDiscord(
  id: string,
  discordId: string,
  discordTokenExpires: number,
  discordTokenAccess: string,
  discordTokenRefresh: string,
  conn: mariadb.Connection
) {
  return conn.execute(
    'UPDATE users SET sso_discord_id = ?, sso_discord_token_expires = ?, sso_discord_token_access = ?, sso_discord_token_refresh = ? WHERE id = ?',
    [discordId, discordTokenExpires, discordTokenAccess, discordTokenRefresh, id]
  );
}

export function removeUserDiscord(discordId: string, conn: mariadb.Connection) {
  return conn.execute(
    'UPDATE users SET sso_discord_id = NULL, sso_discord_token_expires = NULL, sso_discord_token_access = NULL, sso_discord_token_refresh = NULL WHERE sso_discord_id = ?',
    [discordId]
  );
}

export async function getUser(id: string, conn: mariadb.Connection): Promise<User | null> {
  const res: Record<string, any>[] = await conn.query(
    'SELECT id, added, last_online, is_banned, notes, sso, username, email, avatar, patron, patron_benefit_user, permissions, admin, alerts_max, alerts_expiry, alerts_update, sso_discord_id, sso_discord_avatar, sso_discord_token_expires, sso_discord_token_access, sso_discord_token_refresh, api_public_key, api_analytics_key, api_rate_limit FROM users WHERE id = ?',
    [id]
  );

  if (res.length === 0) {
    return null;
  }

  const row = res[0];
  return rowToUser(row);
}

export async function getUserByEmail(
  email: string,
  conn: mariadb.Connection
): Promise<User | null> {
  const res: Record<string, any>[] = await conn.query(
    'SELECT id, added, last_online, is_banned, notes, sso, username, email, avatar, patron, patron_benefit_user, permissions, admin, alerts_max, alerts_expiry, alerts_update, sso_discord_id, sso_discord_avatar, sso_discord_token_expires, sso_discord_token_access, sso_discord_token_refresh, api_public_key, api_analytics_key, api_rate_limit FROM users WHERE email = ?',
    [email]
  );

  if (res.length === 0) {
    return null;
  }

  const row = res[0];
  return rowToUser(row);
}

export async function getUserByDiscordId(
  discordId: string,
  conn: mariadb.Connection
): Promise<User | null> {
  const res: Record<string, any>[] = await conn.query(
    'SELECT id, added, last_online, is_banned, notes, sso, username, email, avatar, patron, patron_benefit_user, permissions, admin, alerts_max, alerts_expiry, alerts_update, sso_discord_id, sso_discord_avatar, sso_discord_token_expires, sso_discord_token_access, sso_discord_token_refresh, api_public_key, api_analytics_key, api_rate_limit FROM users WHERE sso_discord_id = ?',
    [discordId]
  );

  if (res.length === 0) {
    return null;
  }

  const row = res[0];
  return rowToUser(row);
}

export function deleteUser(id: string, conn: mariadb.Connection) {
  return conn.query('DELETE FROM users WHERE id = ?', [id]);
}

function rowToUser(user: Record<string, any>): User {
  return {
    id: user['id'],
    added: user['added'],
    lastOnline: user['last_online'],
    isBanned: user['is_banned'],
    notes: user['notes'],
    sso: user['sso'],
    username: user['username'],
    email: user['email'],
    avatar: user['avatar'],
    patron: user['patron'],
    patronBenefitUser: user['patron_benefit_user'],
    permissions: user['permissions'],
    admin: user['admin'],
    alertsMax: user['alerts_max'],
    alertsExpiry: user['alerts_expiry'],
    alertsUpdate: user['alerts_update'],
    ssoDiscordId: user['sso_discord_id'],
    ssoDiscordAvatar: user['sso_discord_avatar'],
    ssoDiscordTokenExpires: user['sso_discord_token_expires'],
    ssoDiscordTokenAccess: user['sso_discord_token_access'],
    ssoDiscordTokenRefresh: user['sso_discord_token_refresh'],
    apiPublicKey: user['api_public_key'],
    apiAnalyticsKey: user['api_analytics_key'],
    apiRateLimit: user['api_rate_limit'],
  };
}
