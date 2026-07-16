/**
 * Centralized environment configuration.
 *
 * This is the SINGLE place in the codebase that reads process.env.
 * Every other module imports from here, so we get one controlled choke
 * point for validation and for keeping secrets (like AI_API_KEY) out of
 * logs and out of responses.
 */
import dotenv from 'dotenv';

// Load variables from .env into process.env (if a .env file exists).
dotenv.config();

const required = (name) => {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const optionalInt = (name, fallback) => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  port: optionalInt('PORT', 3000),

  // --- Database ------------------------------------------------------------
  // Default to SQLite so the project runs locally with zero infra setup.
  // Switch to postgres later by setting DB_DIALECT=postgres in .env.
  db: {
    // PostgreSQL is the canonical DB for Subh. SQLite is supported only as a
    // fallback for environments where Postgres cannot be installed.
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: optionalInt('DB_PORT', 5432),
    name: process.env.DB_NAME || 'subh_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    // SSL toggle ("true"/"1"/"yes"). Supabase rejects unencrypted connections.
    ssl: ['true', '1', 'yes'].includes((process.env.DB_SSL || '').toLowerCase()),
    // SQLite-only: where to store the file.
    storage: process.env.DB_STORAGE || './data/subh.sqlite',
  },

  // --- AI integration ------------------------------------------------------
  // Read ONLY from the environment. Never written to disk, never echoed back
  // in any response. We expose a boolean for status checks and the key itself
  // stays private behind a function boundary.
  aiApiKey: process.env.AI_API_KEY || '',
  aiApiKeyConfigured: Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== ''),
  aiProvider: process.env.AI_PROVIDER || 'openai',
  // Model used for semantic analysis (intent extraction). gpt-4o-mini is cheap
  // and more than enough for structured JSON extraction.
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  // Hard timeout (ms) for a single OpenAI call. AbortController enforces it so
  // a slow/hung provider never blocks a request worker indefinitely.
  aiTimeoutMs: Math.min(Math.max(optionalInt('AI_TIMEOUT_MS', 15000), 1000), 60000),
  // Max completion tokens for the analysis call. Kept small — we only need a
  // tiny JSON object back, not free-form text.
  aiMaxTokens: Math.min(Math.max(optionalInt('AI_MAX_TOKENS', 512), 64), 4096),

  // --- Auth (JWT) ----------------------------------------------------------
  // Secret used to sign auth tokens. Falls back to a dev-only value so the
  // server still boots locally; production MUST set JWT_SECRET explicitly.
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

/**
 * Validate at boot. We fail fast so the server never starts in a half-broken
 * config (e.g. wrong DB dialect). AI_API_KEY is intentionally NOT required at
 * boot — the AI feature is optional and degrades gracefully.
 */
export function validateEnv() {
  const errors = [];

  const supportedDialects = ['sqlite', 'postgres', 'mysql'];
  if (!supportedDialects.includes(env.db.dialect)) {
    errors.push(
      `DB_DIALECT "${env.db.dialect}" is not supported. Use one of: ${supportedDialects.join(', ')}`,
    );
  }

  if (env.db.dialect !== 'sqlite') {
    if (!env.db.name) errors.push('DB_NAME is required when DB_DIALECT is not sqlite');
    if (!env.db.user) errors.push('DB_USER is required when DB_DIALECT is not sqlite');
  }

  if (errors.length) {
    throw new Error(`Environment validation failed:\n  - ${errors.join('\n  - ')}`);
  }

  return env;
}

export default env;
