import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running database migrations.');

const databaseDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../database');
const migrationsDirectory = resolve(databaseDirectory, 'migrations');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('SELECT pg_advisory_lock($1)', [84261027]);
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrations = (await readdir(migrationsDirectory))
    .filter((filename) => /^\d+_[a-z0-9_-]+\.sql$/i.test(filename))
    .sort();
  for (const filename of migrations) {
    const applied = await client.query(
      'SELECT 1 FROM schema_migrations WHERE version = $1',
      [filename],
    );
    if (applied.rowCount) continue;

    const sql = await readFile(resolve(migrationsDirectory, filename), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [filename]);
      await client.query('COMMIT');
      console.log(`Applied migration ${filename}.`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
  console.log(`Database migrations are up to date (${migrations.length} discovered).`);
} finally {
  try {
    await client.query('SELECT pg_advisory_unlock($1)', [84261027]);
  } finally {
    client.release();
    await pool.end();
  }
}
