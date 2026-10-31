import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { TOTP, Secret } from 'otpauth';

const DB_PATH = path.resolve('mindspark.db');
const CREDENTIALS_PATH = path.resolve('TEST_ACCOUNT.md');

const EMAIL = 'test.staff@mindsparkhub.org';
const NAME = 'Test Staff Account';
const ROLE = 'SUPER_ADMIN';

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(
      password,
      salt,
      64,
      { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      }
    );
  });
}

async function main() {
  const db = new DatabaseSync(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      mfa_enabled INTEGER DEFAULT 0,
      mfa_secret TEXT,
      mfa_backup_codes TEXT,
      is_active INTEGER DEFAULT 1,
      failed_sign_ins INTEGER DEFAULT 0,
      locked_until TEXT,
      last_sign_in_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const password = crypto.randomBytes(12).toString('base64url');
  const passwordHash = await hashPassword(password);

  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: 'MindSpark Hub',
    label: EMAIL,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  const backupCodes = [];
  const hashedBackupCodes = [];
  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(code);
    hashedBackupCodes.push(crypto.createHash('sha256').update(code).digest('hex'));
  }

  const now = new Date().toISOString();
  const id = 'usr_test_staff';

  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  db.prepare(`
    INSERT OR REPLACE INTO users (
      id, name, email, password_hash, role, mfa_enabled, mfa_secret, mfa_backup_codes,
      is_active, failed_sign_ins, locked_until, last_sign_in_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, 1, 0, NULL, NULL, ?, ?)
  `).run(
    id,
    NAME,
    EMAIL,
    passwordHash,
    ROLE,
    secret.base32,
    JSON.stringify(hashedBackupCodes),
    now,
    now
  );

  const totpCommand = `node --input-type=module -e "import {TOTP,Secret} from 'otpauth'; const t=new TOTP({secret:Secret.fromBase32('${secret.base32}'),digits:6,period:30,algorithm:'SHA1'}); console.log(t.generate())"`;

  const contents = `# Test Staff Account

Local test credentials. This file is gitignored and must not be committed or shared publicly.

- Dashboard URL: /admin/login
- Email: ${EMAIL}
- Password: ${password}
- Role: ${ROLE}
- MFA secret: ${secret.base32}
- MFA enrollment URI: ${totp.uri}

## Current authenticator code

Run this inside the project folder to print the current 6 digit code:

\`\`\`
${totpCommand}
\`\`\`

## Single use backup codes

${backupCodes.map((code) => `- ${code}`).join('\n')}

Each backup code works once. The TOTP secret above can be added to any authenticator app.
`;

  fs.writeFileSync(CREDENTIALS_PATH, contents, 'utf8');

  console.log('Test staff account created successfully.');
  console.log(`Email: ${EMAIL}`);
  console.log(`Password: ${password}`);
  console.log(`MFA secret: ${secret.base32}`);
  console.log(`Credentials saved to ${CREDENTIALS_PATH} (gitignored).`);
}

main().catch((err) => {
  console.error('Failed to create test account:', err);
  process.exit(1);
});
