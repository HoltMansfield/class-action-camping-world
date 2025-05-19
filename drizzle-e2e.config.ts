import type { Config } from "drizzle-kit";

// Determine if we're in E2E test mode
const isE2ETest = process.env.E2E_TEST === 'true';

// Define the configuration
const config: Config = {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  // Use different database credentials based on environment
  dbCredentials: isE2ETest
    ? {
        // For PGlite in E2E tests, we still need a valid URL format
        // but it will be ignored since PGlite is in-memory
        url: 'postgresql://pglite@localhost/test',
      }
    : {
        // Regular Neon PostgreSQL connection for non-E2E environments
        url: process.env.DB_URL ?? '',
      },
} satisfies Config;

export default config;