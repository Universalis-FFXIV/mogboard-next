import mariadb from 'mariadb';
import { acquireConn, releaseConn } from './connect';

export function unix() {
  return Math.floor(new Date().valueOf() / 1000);
}

export async function rentConnectionForFn<T>(
  fn: (conn: mariadb.Connection) => Promise<T>
): Promise<T> {
  const conn = await acquireConn();
  try {
    return await fn(conn);
  } catch (err) {
    throw err;
  } finally {
    await releaseConn(conn);
  }
}
