import { pushSchema } from "drizzle-kit/api";
import * as schema from "../src/db/schema.ts";
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

/**
 * Setup the E2E test database schema
 * This is separated from the main getDb.ts to avoid module loading issues
 */
export async function setupE2DSchema(db: PgDatabase<any>): Promise<void> {
  try {
    console.log("[E2D-Setup] Pushing schema to PGlite database");
    await pushSchema(schema, db);
    console.log("[E2D-Setup] Schema push completed successfully");
  } catch (error) {
    console.error("[E2D-Setup] Error pushing schema:", error);
    throw error;
  }
}

/**
 * Initialize PGlite and setup the schema
 * This function is called directly when this file is executed as a script
 */
async function main() {
  try {
    console.log("[E2E-Setup] Initializing PGlite for E2E tests");
    
    // Initialize PGlite
    const pgClient = new PGlite({
      dataDir: "memory://",
    });
    
    await pgClient.waitReady;
    console.log("[E2E-Setup] PGlite initialized");
    
    // Create Drizzle instance
    const db = drizzle(pgClient, { schema });
    
    // Push schema to database
    // Use type assertion to any to bridge the incompatible types
    await setupE2DSchema(db as any);
    
    console.log("[E2E-Setup] Database setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("[E2E-Setup] Setup failed:", error);
    process.exit(1);
  }
}

// Run the main function when this file is executed directly
main();
