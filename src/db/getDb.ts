import * as schema from "./schema";
import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import type { PgDatabase } from 'drizzle-orm/pg-core';

type DatabaseType = PgDatabase<any> | (ReturnType<typeof drizzle> & { $client: PGlite });

// Create a singleton pattern for database connections
let pgClient: PGlite | null = null;
let neonPool: any = null;
let dbInstance: DatabaseType | null = null;

/**
 * Get database instance with proper connection based on environment
 */
export async function getDb(): Promise<DatabaseType> {
  if (dbInstance) return dbInstance;

  if (process.env.E2E_TEST === "true") {
    try {
      console.log("[Database] Initializing PGlite for E2E tests");
      
      if (!pgClient) {
        const wasmPath = new URL(
          "../../node_modules/@electric-sql/pglite/dist/pglite.wasm", 
          import.meta.url
        ).pathname;
        
        const wasmBinary = await fetch(wasmPath).then(res => res.arrayBuffer());
        const wasmModule = await WebAssembly.compile(wasmBinary);

        pgClient = new PGlite({
          dataDir: "memory://",
          wasmModule
        });
        
        await pgClient.waitReady;
        dbInstance = drizzle(pgClient, { schema }) as DatabaseType;
        
        console.log("[Database] PGlite initialized successfully");
        return dbInstance;
      }
    } catch (error) {
      console.error("[Database] Error initializing PGlite:", error);
      throw error;
    }
  } else {
    try {
      console.log("[Database] Connecting to Neon PostgreSQL");

      const { drizzle } = await import("drizzle-orm/neon-serverless");
      const { Pool } = await import("@neondatabase/serverless");

      if (!neonPool) {
        neonPool = new Pool({ connectionString: process.env.DB_URL! });
      }
      dbInstance = drizzle(neonPool, { schema });
    } catch (error) {
      console.error("[Database] Error initializing Neon connection:", error);
      throw error;
    }
  }

  return dbInstance!;
}

// Export the database instance
export const db = getDb();
