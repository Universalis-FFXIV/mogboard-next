import mariadb from 'mariadb';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const port = parseInt(serverRuntimeConfig.dbPort ?? '');
const connections = parseInt(serverRuntimeConfig.dbConnections ?? '');
const pool = mariadb.createPool({
  host: serverRuntimeConfig.dbHost ?? '',
  port: isNaN(port) ? 0 : port,
  user: serverRuntimeConfig.dbUser ?? '',
  password: serverRuntimeConfig.dbPass ?? '',
  database: serverRuntimeConfig.dbName ?? '',
  connectionLimit: connections,
});

export function acquireConn() {
  return pool.getConnection();
}

export function releaseConn(conn: mariadb.PoolConnection) {
  return conn.release();
}
