import mariadb from 'mariadb';

const isDev = process.env['APP_ENV'] !== 'prod';

const port = parseInt(process.env['DATABASE_PORT'] ?? '');
const connections = parseInt(process.env['DATABASE_CONNECTIONS'] ?? '');
const pool = mariadb.createPool({
  host: process.env['DATABASE_HOST'] ?? '',
  port: isNaN(port) ? 0 : port,
  user: process.env['DATABASE_USER'] ?? '',
  password: process.env['DATABASE_PASS'] ?? '',
  database: process.env['DATABASE_NAME'] ?? '',
  connectionLimit: connections,
  trace: isDev,
});

export function acquireConn() {
  return pool.getConnection();
}

export function releaseConn(conn: mariadb.PoolConnection) {
  return conn.release();
}
