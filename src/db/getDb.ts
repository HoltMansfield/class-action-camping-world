/**
 * Main database entry point that delegates to the appropriate implementation
 * based on the environment.
 */

import { getE2EDb } from './get-e2e-db';
import { getNeonDb } from './get-neon-db';
import { stopE2EDb } from './get-e2e-db';

// Import implementations but with dynamic imports to prevent bundling issues
let dbInstance: any = null;

/**
 * Get database instance with proper connection based on environment
 */
export async function getDb() {
  if (dbInstance) return dbInstance;

  if (process.env.E2E_TEST === "true") {
    // For E2E tests, use TestContainers PostgreSQL
    dbInstance = await getE2EDb();
  } else {
    // For regular development/production, use Neon PostgreSQL
    dbInstance = await getNeonDb();
  }

  return dbInstance;
}

/**
 * Stop the database and clean up resources
 * Call this function in your Playwright global teardown
 */
export async function stopDb() {
  if (process.env.E2E_TEST === "true" && dbInstance) {
    await stopE2EDb();
    dbInstance = null;
  }
}

// Export the database instance
export const dbPromise = getDb();
