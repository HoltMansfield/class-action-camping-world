/**
 * Playwright global setup: spins up the test DB container, runs migrations, and exports DB env vars.
 */
// ESM global setup for Playwright: start testcontainer, write .env.e2e, run migrations
import fs from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
  console.log('[global-setup] Starting PostgreSQL testcontainer...');
  const container = await new PostgreSqlContainer()
    .withDatabase('testdb')
    .withUsername('test')
    .withPassword('test')
    .start();

  const dbUrl = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`;
  console.log('[global-setup] Test DB URL:', dbUrl);

  // Write DATABASE_URL to .env.e2e for app/migrations
  const envPath = path.resolve(__dirname, '../.env.e2e');
  await fs.writeFile(envPath, `DATABASE_URL=${dbUrl}\n`, 'utf-8');
  console.log('[global-setup] Wrote .env.e2e');

  // Run drizzle-kit migrate using this .env.e2e
  console.log('[global-setup] Running drizzle-kit migrate...');
  const migrate = spawnSync(
    'npx',
    ['dotenv', '-e', '.env.e2e', '--', 'drizzle-kit', 'migrate'],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
  );
  if (migrate.status !== 0) {
    throw new Error('Drizzle migrations failed');
  }
  console.log('[global-setup] Migrations complete. Ready to test!');

  // Save container info for teardown
  global.__E2E_CONTAINER__ = container;
  // Optionally, write container info to a file if teardown needs it
  await fs.writeFile(path.resolve(__dirname, '../.e2e-container-id'), container.getId(), 'utf-8');
}

