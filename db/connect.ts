import mariadb from 'mariadb';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const port = parseInt(serverRuntimeConfig.dbPort ?? '');
const pool = mariadb.createPool({
  host: serverRuntimeConfig.dbHost ?? '',
  port: isNaN(port) ? 0 : port,
  user: process.env['DATABASE_USER'] ?? '',
  password: process.env['DATABASE_PASS'] ?? '',
  database: process.env['DATABASE_NAME'] ?? '',
  connectionLimit: 4,
});

export function acquireConn() {
  return pool.getConnection();
}

export function releaseConn(conn: mariadb.PoolConnection) {
  return conn.release();
}
