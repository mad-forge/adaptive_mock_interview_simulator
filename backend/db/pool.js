import pg from 'pg';

const dbUrl = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, '');

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
