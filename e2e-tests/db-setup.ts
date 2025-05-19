// e2e-tests/global-setup.ts
import { WebSocket } from 'ws';
import { execSync } from 'child_process';
import fs from 'fs';

// Conditionally import based on E2E_TEST environment variable
let isE2ETest = process.env.E2E_TEST === 'true';

let fetchPromise: Promise<typeof fetch> | null = null;
async function polyfillGlobals() {
  if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = WebSocket as any;
  }
  if (typeof globalThis.fetch === 'undefined') {
    if (!fetchPromise) {
      fetchPromise = import('node-fetch').then(mod => mod.default as unknown as typeof fetch);
    }
    (global as any).fetch = (await fetchPromise) as unknown as typeof globalThis.fetch;
  }
}

const dbSetup = async () => {
  await polyfillGlobals();
  
  if (isE2ETest) {
    console.log(`[global-setup] Using PGlite for E2E tests (in-memory PostgreSQL)`);
    // When using PGlite, we don't need to do any database cleanup since it's in-memory
    // and starts fresh each time
    try {
      const { PGlite } = await import('@electric-sql/pglite');
      // Initialize PGlite instance to ensure it works
      const client = new PGlite();
      await client.query('SELECT 1');
      console.log(`[global-setup] PGlite initialized successfully.`);
    } catch (error) {
      console.error(`[global-setup] Error initializing PGlite:`, error);
      throw error;
    }
  } else {
    // Use Neon PostgreSQL for non-E2E testing environments
    console.log(`[global-setup] Using Neon PostgreSQL`);
    const dbUrl = process.env.DB_URL;
    if (dbUrl && dbUrl.startsWith('postgresql://')) {
      console.log(`[global-setup] Connecting to Neon Postgres for clean slate...`);
      const { Client } = await import('@neondatabase/serverless');
      const client = new Client(dbUrl);
      await client.connect();
      try {
        // Drop all tables in the public schema
        await client.query(`
          DO $$ DECLARE
            r RECORD;
          BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
            END LOOP;
          END $$;
        `);
        console.log(`[global-setup] Dropped all tables in Neon Postgres database.`);
      } finally {
        await client.end();
      }
    }
  }

  // Remove e2e-migrations directory for a clean slate
  const migrationsPath = process.env.MIGRATIONS_PATH || './drizzle/e2e-migrations';
  if (fs.existsSync(migrationsPath)) {
    console.log(`[global-setup] Removing existing migrations at ${migrationsPath}`);
    fs.rmSync(migrationsPath, { recursive: true, force: true });
  }

  // Regenerate migrations
  console.log(`[global-setup] Generating fresh migrations in ${migrationsPath}`);
  // Pass E2E_TEST environment variable to drizzle-kit commands
  execSync('E2E_TEST=true npx drizzle-kit generate --config=drizzle-e2e.config.ts', { 
    stdio: 'inherit',
    env: { ...process.env, E2E_TEST: 'true' }
  });

  // Run Drizzle migrations
  console.log(`[global-setup] Pushing migrations to database`);
  execSync('E2E_TEST=true npx drizzle-kit push --config=drizzle-e2e.config.ts', { 
    stdio: 'inherit',
    env: { ...process.env, E2E_TEST: 'true' }
  });
};

dbSetup();