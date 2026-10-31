import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { DatabaseSync } from 'node:sqlite';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
  console.error('DATABASE_URL must be a Supabase PostgreSQL connection string.');
  process.exit(1);
}

const schemaSource = fs.readFileSync(path.join(process.cwd(), 'src/lib/db/index.ts'), 'utf8');
const schemaMatch = schemaSource.match(/const SQLITE_SCHEMA = `([\s\S]*?)`;/);

if (!schemaMatch) {
  console.error('Could not read the database schema from src/lib/db/index.ts.');
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  prepare: false,
  ssl: process.env.DATABASE_SSL === 'false' ? false : 'require',
  max: 1,
  connect_timeout: 20,
  onnotice: () => {},
});

const statements = schemaMatch[1]
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

console.log('Creating Supabase PostgreSQL schema...');
for (const statement of statements) {
  await sql.unsafe(statement);
}
console.log('Schema ready.');

const sqlitePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'mindspark.db');

if (!fs.existsSync(sqlitePath)) {
  console.log(`No local SQLite database found at ${sqlitePath}. The schema is ready and the database is empty.`);
  await sql.end();
  process.exit(0);
}

const sqlite = new DatabaseSync(sqlitePath);

const tables = [
  'users',
  'programmes',
  'events',
  'units',
  'exco_members',
  'gallery_items',
  'articles',
  'submissions',
  'system_settings',
  'audit_logs',
];

const excludedUsers = new Set(
  (process.env.EXCLUDE_USER_IDS || 'usr_test_staff')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

for (const table of tables) {
  let rows;
  try {
    rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
  } catch (error) {
    console.warn(`Skipping ${table}: ${error.message}`);
    continue;
  }

  if (table === 'users') {
    rows = rows.filter((row) => !excludedUsers.has(row.id));
  }

  let inserted = 0;
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = columns.map((column) => row[column] ?? null);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    await sql.unsafe(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values
    );
    inserted += 1;
  }

  console.log(`${table}: ${inserted} row(s) copied`);
}

sqlite.close();
await sql.end();
console.log('Migration complete.');
console.log('Create or rotate the production admin password with: npm run admin:create');
