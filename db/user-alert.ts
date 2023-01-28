import { UserAlert } from '../types/universalis/user';
import mariadb from 'mariadb';

export async function getUserAlerts(
  userId: string,
  conn: mariadb.Connection
): Promise<UserAlert[]> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT `id`, `user_id`, `item_id`, `world_id`, `discord_webhook`, `trigger_version`, `trigger` FROM `users_alerts_next` WHERE `user_id` = ?',
    [userId]
  );
  return rows.map(rowToUserAlert);
}

export function updateUserAlert(alert: UserAlert, conn: mariadb.Connection) {
  return conn.query(
    'UPDATE `users_alerts_next` SET `world_id` = ?, `discord_webhook` = ?, `trigger_version` = ?, `trigger` = ? WHERE `id` = ? AND `user_id` = ?',
    [
      alert.worldId,
      alert.discordWebhook,
      alert.triggerVersion,
      JSON.stringify(alert.trigger),
      alert.id,
      alert.userId,
    ]
  );
}

function rowToUserAlert(row: Record<string, any>): UserAlert {
  return {
    id: row['id'],
    userId: row['user_id'],
    itemId: row['item_id'],
    worldId: row['world_id'],
    discordWebhook: row['discord_webhook'],
    triggerVersion: row['trigger_version'],
    trigger: JSON.parse(row['trigger']),
  };
}
