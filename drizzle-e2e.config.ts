import type { Config } from "drizzle-kit";

// Determine if we're in E2E test mode
const isE2ETest = process.env.E2E_TEST === 'true';

/**
 * For E2E tests, we use TestContainers to create a PostgreSQL container.
 * The database connection is managed in getDb.ts, which dynamically creates
 * a PostgreSQL container when E2E_TEST=true.
 * 
 * This config file doesn't need database credentials for E2E tests because:
 * 1. When generating migrations (drizzle-kit generate), no DB connection is needed
 * 2. When pushing migrations (drizzle-kit push), the DB connection is handled by
 *    the custom migrator in db-setup.ts that uses the TestContainers instance
 */

// Define the configuration
const config: Config = {
  schema: "./src/db/schema.ts",
  out: "./drizzle/e2e-migrations",
  dialect: "postgresql",
  // For E2E tests, we don't need database credentials as the connection
  // is managed by TestContainers in getDb.ts
  dbCredentials: isE2ETest
    ? undefined
    : {
        // This fallback should never be used for E2E tests, but is here for completeness
        url: process.env.E2E_DB_URL ?? '',
      },
} satisfies Config;

export default config;