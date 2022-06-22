import mariadb from 'mariadb';

const pool = mariadb.createPool(process.env['DATABASE_URL'] ?? '');

export function acquireConn() {
  return pool.getConnection();
}

export function releaseConn(conn: mariadb.PoolConnection) {
  return conn.release();
}
