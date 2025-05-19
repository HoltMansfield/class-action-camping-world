/**
 * Playwright global setup: spins up the test DB container, runs migrations, and exports DB env vars.
 */
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = async function globalSetup() {
  console.log('[global-setup] Starting E2E DB container...');
  process.env.E2E_TEST = 'true';

  // Start the container (and create the DB) by requiring getDb
  const { getDb } = await import('../src/db/getDb.js');
  await getDb();

  // Now run drizzle migrations against the running container
  console.log('[global-setup] Running migrations...');
  const migrate = spawnSync(
    'npx',
    ['dotenv', '-e', 'database/e2e.env', '--', 'drizzle-kit', 'migrate'],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
  );
  if (migrate.status !== 0) {
    throw new Error('Drizzle migrations failed');
  }
  console.log('[global-setup] Migrations complete. Ready to test!');
};
