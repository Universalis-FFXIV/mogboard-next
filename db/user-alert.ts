import { UserAlert } from '../types/universalis/user';
import mariadb from 'mariadb';

export async function getUserAlerts(
  userId: string,
  conn: mariadb.Connection
): Promise<UserAlert[]> {
  const rows: Record<string, any>[] = await conn.query(
    'SELECT id, user_id, item_id, world_id, discord_webhook, trigger_version, trigger FROM users_alerts_next WHERE user_id = ?',
    [userId]
  );
  return rows.map(rowToUserAlert);
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
