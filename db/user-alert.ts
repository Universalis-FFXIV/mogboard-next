import { UserAlert } from '../types/universalis/user';
import mariadb from 'mariadb';

export const USER_ALERT_MAX = 40;

export async function getUserAlerts(
  userId: string,
  conn: mariadb.Connection
): Promise<UserAlert[]> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT `id`, `user_id`, `name`, `item_id`, `world_id`, `discord_webhook`, `trigger_version`, `trigger` FROM `users_alerts_next` WHERE `user_id` = ?',
    [userId]
  );
  return rows.map(rowToUserAlert);
}

export async function getUserAlert(
  userId: string,
  alertId: string,
  conn: mariadb.Connection
): Promise<UserAlert | null> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT `id`, `user_id`, `name`, `item_id`, `world_id`, `discord_webhook`, `trigger_version`, `trigger` FROM `users_alerts_next` WHERE `id` = ? AND `user_id` = ?',
    [alertId, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rowToUserAlert(rows[0]);
}

export function updateUserAlert(alert: UserAlert, conn: mariadb.Connection) {
  return conn.query(
    'UPDATE `users_alerts_next` SET `world_id` = ?, `name` = ?, `discord_webhook` = ?, `trigger_version` = ?, `trigger` = ? WHERE `id` = ? AND `user_id` = ?',
    [
      alert.worldId,
      alert.name,
      alert.discordWebhook,
      alert.triggerVersion,
      JSON.stringify(alert.trigger),
      alert.id,
      alert.userId,
    ]
  );
}

export function createUserAlert(alert: UserAlert, conn: mariadb.Connection) {
  return conn.query(
    'INSERT INTO `users_alerts_next` (`id`, `user_id`, `name`, `item_id`, `world_id`, `discord_webhook`, `trigger_version`, `trigger`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      alert.id,
      alert.userId,
      alert.name,
      alert.itemId,
      alert.worldId,
      alert.discordWebhook,
      alert.triggerVersion,
      JSON.stringify(alert.trigger),
    ]
  );
}

export function deleteUserAlert(userId: string, alertId: string, conn: mariadb.Connection) {
  return conn.query('DELETE FROM `users_alerts_next` WHERE id = ? AND user_id = ?', [
    alertId,
    userId,
  ]);
}

function rowToUserAlert(row: Record<string, any>): UserAlert {
  return {
    id: row['id'],
    userId: row['user_id'],
    name: row['name'],
    itemId: row['item_id'],
    worldId: row['world_id'],
    discordWebhook: row['discord_webhook'],
    triggerVersion: row['trigger_version'],
    trigger: JSON.parse(row['trigger']),
  };
}
