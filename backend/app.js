/**
 * Express application composition.
 *
 * Wires middleware, registers the API router (all CRUD modules), and installs
 * a centralized error handler that understands Sequelize errors.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Sequelize } from 'sequelize';

import env, { validateEnv } from './config/env.js';
import logger from './config/logger.js';
import { bootDatabase, testDatabaseConnection } from './config/database.js';

import healthRoutes from './routes/healthRoutes.js';
import aiDemoRoutes from './routes/aiDemoRoutes.js';
import { createApiRouter } from './routes/index.js';
import { ApiError } from './utils/ApiError.js';
import { AiProviderError } from './modules/ai/utils/aiErrors.js';

const app = express();

// --- Security & observability middleware -------------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  morgan(env.isProd ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// --- Info + meta routes ------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    name: 'Subh Backend',
    architecture: 'Modular Monolith',
    version: '0.3.0',
    endpoints: '/api/health, /api/ai-status, /api/{resource}',
    docs: 'See README.md for the full endpoint list.',
  });
});

app.use('/api', healthRoutes);
app.use('/api', aiDemoRoutes);

// The CRUD API router + 404 + error handler are mounted inside bootApp(),
// AFTER the API router, so request matching happens in the right order.

/**
 * Boot the application: validate env, connect DB, register models, and mount
 * the CRUD API router. Called by server.js before listen().
 */
export async function bootApp() {
  validateEnv();
  logger.info(`Validating environment ... dialect=${env.db.dialect}`);

  const { models } = await bootDatabase();
  app.locals.models = models; // available, but prefer factory injection
  logger.info(`Database connection established. ${Object.keys(models).length} models registered.`);

  // Mount all CRUD routes now that models are available.
  app.use('/api', createApiRouter({ models }));

  // --- 404 (must come AFTER the API router) --------------------------------
  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Not Found' });
  });

  // --- Centralized error handler -------------------------------------------
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    logger.error(err);

    // AI provider failures carry a machine-readable `code` (timeout /
    // provider_error / parse_error / not_configured). Surface it so clients can
    // react, but keep the body free of keys or raw provider payloads.
    // NOTE: this MUST come before the generic ApiError branch — AiProviderError
    // extends ApiError, so the ApiError check would otherwise swallow it.
    if (err instanceof AiProviderError) {
      return res.status(err.status).json({
        ok: false,
        error: err.message,
        code: err.code,
        details: err.details,
      });
    }
    if (err instanceof ApiError) {
      return res.status(err.status).json({ ok: false, error: err.message, details: err.details });
    }
    if (err instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).json({
        ok: false,
        error: 'Resource already exists',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      });
    }
    if (err instanceof Sequelize.ValidationError) {
      return res.status(422).json({
        ok: false,
        error: 'Validation failed',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      });
    }
    if (err instanceof Sequelize.ForeignKeyConstraintError) {
      return res.status(400).json({
        ok: false,
        error: 'Referenced resource does not exist',
        details: err.fields,
      });
    }
    return res.status(err.status || 500).json({
      ok: false,
      error: env.isProd ? 'Internal Server Error' : err.message,
    });
  });

  return { app, models };
}

export { testDatabaseConnection };
export default app;
