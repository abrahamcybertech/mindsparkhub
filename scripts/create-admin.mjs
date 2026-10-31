import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const email = (process.env.ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD || '';
const name = (process.env.ADMIN_NAME || 'Super Administrator').trim();
const role = (process.env.ADMIN_ROLE || 'SUPER_ADMIN').trim().toUpperCase();
const allowedRoles = new Set(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'PROGRAMME_MANAGER']);

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (or INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD) first.');
  process.exit(1);
}

if (password.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

if (!allowedRoles.has(role)) {
  console.error(`Invalid ADMIN_ROLE. Use one of: ${Array.from(allowedRoles).join(', ')}`);
  process.exit(1);
}

function hashPassword(value) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(value, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (error, key) => {
      if (error) return reject(error);
      resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

const schemaSource = fs.readFileSync(path.join(process.cwd(), 'src/lib/db/index.ts'), 'utf8');
const schemaMatch = schemaSource.match(/const SQLITE_SCHEMA = `([\s\S]*?)`;/);
if (!schemaMatch) {
  console.error('Could not read the database schema from src/lib/db/index.ts.');
  process.exit(1);
}

const statements = schemaMatch[1]
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

const passwordHash = await hashPassword(password);
const now = new Date().toISOString();
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && /^postgres(ql)?:\/\//.test(databaseUrl)) {
  const { default: postgres } = await import('postgres');
  const sql = postgres(databaseUrl, {
    prepare: false,
    ssl: process.env.DATABASE_SSL === 'false' ? false : 'require',
    max: 1,
    connect_timeout: 20,
    onnotice: () => {},
  });

  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  const existing = await sql.unsafe('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.length > 0) {
    await sql.unsafe(
      `UPDATE users SET
        name = $1,
        password_hash = $2,
        role = $3,
        is_active = 1,
        mfa_enabled = 0,
        mfa_secret = NULL,
        mfa_backup_codes = NULL,
        failed_sign_ins = 0,
        locked_until = NULL,
        updated_at = $4
      WHERE email = $5`,
      [name, passwordHash, role, now, email]
    );
    console.log(`Updated ${role} account: ${email}`);
  } else {
    await sql.unsafe(
      `INSERT INTO users (
        id, name, email, password_hash, role, mfa_enabled, mfa_secret, mfa_backup_codes,
        is_active, failed_sign_ins, locked_until, last_sign_in_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 0, NULL, NULL, 1, 0, NULL, NULL, $6, $6)`,
      [crypto.randomUUID(), name, email, passwordHash, role, now]
    );
    console.log(`Created ${role} account: ${email}`);
  }

  await sql.end();
} else {
  const dbPath = process.env.DATABASE_FILE || path.join(process.cwd(), 'mindspark.db');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');

  for (const statement of statements) {
    db.exec(statement);
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

  if (existing) {
    db.prepare(
      `UPDATE users SET
        name = ?,
        password_hash = ?,
        role = ?,
        is_active = 1,
        mfa_enabled = 0,
        mfa_secret = NULL,
        mfa_backup_codes = NULL,
        failed_sign_ins = 0,
        locked_until = NULL,
        updated_at = ?
      WHERE email = ?`
    ).run(name, passwordHash, role, now, email);
    console.log(`Updated ${role} account: ${email}`);
  } else {
    db.prepare(
      `INSERT INTO users (
        id, name, email, password_hash, role, mfa_enabled, mfa_secret, mfa_backup_codes,
        is_active, failed_sign_ins, locked_until, last_sign_in_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, NULL, NULL, 1, 0, NULL, NULL, ?, ?)`
    ).run(crypto.randomUUID(), name, email, passwordHash, role, now, now);
    console.log(`Created ${role} account: ${email}`);
  }

  db.close();
}
