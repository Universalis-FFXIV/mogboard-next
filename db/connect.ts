import mariadb from 'mariadb';

const isDev = process.env['APP_ENV'] !== 'prod';

const port = parseInt(process.env['DATABASE_PORT'] ?? '');
const connections = parseInt(process.env['DATABASE_CONNECTIONS'] ?? '');

declare namespace global {
  export var pool: mariadb.Pool | undefined;
}

// In development, hot-reloading rebuilds the pool, so the database
// hits the connection limit fairly quickly. This hack prevents that
// from happening.
if (global.pool == null) {
  global.pool = mariadb.createPool({
    host: process.env['DATABASE_HOST'] ?? '',
    port: isNaN(port) ? 0 : port,
    user: process.env['DATABASE_USER'] ?? '',
    password: process.env['DATABASE_PASS'] ?? '',
    database: process.env['DATABASE_NAME'] ?? '',
    connectionLimit: connections,
    idleTimeout: 30000,
    trace: isDev,
  });
}

export function acquireConn() {
  if (global.pool == null) {
    throw new Error('The connection pool has not been initialized.');
  }

  return global.pool.getConnection();
}

export function releaseConn(conn: mariadb.PoolConnection) {
  return conn.release();
}
