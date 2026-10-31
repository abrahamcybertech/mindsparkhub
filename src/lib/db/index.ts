import path from 'node:path';

export interface QueryResult {
  changes: number;
}

export interface PreparedStatement {
  get(...params: any[]): Promise<any>;
  all(...params: any[]): Promise<any[]>;
  run(...params: any[]): Promise<QueryResult>;
}

export interface Database {
  prepare(query: string): PreparedStatement;
  exec(query: string): Promise<void>;
}

interface Backend {
  all(query: string, params: any[]): Promise<any[]>;
  run(query: string, params: any[]): Promise<QueryResult>;
  exec(query: string): Promise<void>;
}

const SQLITE_SCHEMA = `
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

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS programmes (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    audience TEXT NOT NULL,
    objectives_json TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    programme_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    venue TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    created_by TEXT NOT NULL,
    approved_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    unit_head_name TEXT NOT NULL,
    description TEXT NOT NULL,
    core_functions_json TEXT NOT NULL,
    guiding_rules_json TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS exco_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    unit_slug TEXT,
    bio TEXT NOT NULL,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_minor_depicted INTEGER DEFAULT 0,
    consent_verified INTEGER DEFAULT 0,
    consent_reference TEXT,
    is_published INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    category TEXT NOT NULL,
    featured_image TEXT NOT NULL,
    reading_time_mins INTEGER DEFAULT 3,
    is_published INTEGER DEFAULT 1,
    published_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    reference_code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    interests TEXT,
    message TEXT NOT NULL,
    consent_given INTEGER NOT NULL,
    is_adult_confirmed INTEGER NOT NULL,
    status TEXT DEFAULT 'NEW',
    internal_notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    details TEXT,
    outcome TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    entry_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    is_public INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mfa_setup_requests (
    user_id TEXT PRIMARY KEY,
    secret TEXT NOT NULL,
    backup_codes TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mobile_access_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mobile_refresh_tokens (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    revoked_at TEXT,
    replaced_by TEXT,
    ip_hash TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mobile_mfa_challenges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS public_challenges (
    id TEXT PRIMARY KEY,
    token_hash TEXT UNIQUE NOT NULL,
    device_hash TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS image_reports (
    id TEXT PRIMARY KEY,
    gallery_item_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'NEW',
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_password_reset_hash ON password_reset_tokens(token_hash);
  CREATE INDEX IF NOT EXISTS idx_mobile_access_hash ON mobile_access_tokens(token_hash);
  CREATE INDEX IF NOT EXISTS idx_mobile_refresh_hash ON mobile_refresh_tokens(token_hash);
  CREATE INDEX IF NOT EXISTS idx_mobile_refresh_family ON mobile_refresh_tokens(family_id);
  CREATE INDEX IF NOT EXISTS idx_mobile_mfa_hash ON mobile_mfa_challenges(token_hash);
  CREATE INDEX IF NOT EXISTS idx_public_challenge_hash ON public_challenges(token_hash);
  CREATE INDEX IF NOT EXISTS idx_image_reports_status ON image_reports(status);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_gallery_pub ON gallery_items(is_published, category);
  CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
  CREATE INDEX IF NOT EXISTS idx_submissions_ref ON submissions(reference_code);
  CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at);
`;

let backendPromise: Promise<Backend> | null = null;

function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL || '';
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}

async function createPostgresBackend(): Promise<Backend> {
  const url = process.env.DATABASE_URL as string;
  const { default: postgres } = await import('postgres');

  const sql = postgres(url, {
    prepare: false,
    ssl: process.env.DATABASE_SSL === 'false' ? false : 'require',
    max: Number(process.env.DATABASE_POOL_MAX || 3),
    idle_timeout: 20,
    connect_timeout: 30,
    onnotice: () => {},
  });

  const autoSchema =
    process.env.DB_AUTO_SCHEMA === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.DB_AUTO_SCHEMA !== 'false');

  if (autoSchema) {
    const statements = SQLITE_SCHEMA.split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    await sql.begin(async (transaction) => {
      await transaction.unsafe('SELECT pg_advisory_xact_lock(764328912)');
      for (const statement of statements) {
        await transaction.unsafe(statement);
      }
    });
  }

  return {
    async all(query: string, params: any[]) {
      const rows = await sql.unsafe(convertPlaceholders(query), params);
      return Array.from(rows as any[]);
    },
    async run(query: string, params: any[]) {
      const result: any = await sql.unsafe(convertPlaceholders(query), params);
      return { changes: Number(result.count || 0) };
    },
    async exec(query: string) {
      await sql.unsafe(query);
    },
  };
}

async function createSqliteBackend(): Promise<Backend> {
  const { DatabaseSync } = await import('node:sqlite');
  const dbPath = process.env.DATABASE_FILE || path.join(process.cwd(), 'mindspark.db');
  const db = new DatabaseSync(dbPath);

  db.exec('PRAGMA foreign_keys = ON;');

  const statements = SQLITE_SCHEMA.split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    db.exec(statement);
  }

  return {
    async all(query: string, params: any[]) {
      return db.prepare(query).all(...params) as any[];
    },
    async run(query: string, params: any[]) {
      const result = db.prepare(query).run(...params);
      return { changes: Number(result.changes || 0) };
    },
    async exec(query: string) {
      db.exec(query);
    },
  };
}

async function getBackend(): Promise<Backend> {
  if (!backendPromise) {
    if (isPostgresConfigured()) {
      backendPromise = createPostgresBackend();
    } else {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SQLITE_IN_PRODUCTION !== 'true') {
        backendPromise = Promise.reject(
          new Error(
            'DATABASE_URL is required in production. Set a Supabase PostgreSQL connection string in your environment.'
          )
        );
      } else {
        backendPromise = createSqliteBackend();
      }
    }
  }

  return backendPromise;
}

function convertPlaceholders(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

export function getDatabase(): Database {
  return {
    prepare(query: string): PreparedStatement {
      return {
        async get(...params: any[]) {
          const backend = await getBackend();
          const rows = await backend.all(query, params);
          return rows[0];
        },
        async all(...params: any[]) {
          const backend = await getBackend();
          return backend.all(query, params);
        },
        async run(...params: any[]) {
          const backend = await getBackend();
          return backend.run(query, params);
        },
      };
    },
    async exec(query: string) {
      const backend = await getBackend();
      await backend.exec(query);
    },
  };
}
