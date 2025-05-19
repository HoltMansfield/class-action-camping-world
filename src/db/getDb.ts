import * as schema from "./schema";

let neonPool: any = null;
let dbInstance: any = null; // Will be typed after drizzle import
let containerInstance: any = null; // Store the container instance

/**
 * Get database instance with proper connection based on environment
 */
export async function getDb() {
  if (dbInstance) return dbInstance;

  if (process.env.E2E_TEST === "true") {
    try {
      const { drizzle } = await import('drizzle-orm/node-postgres');
      const { PostgreSqlContainer } = await import("@testcontainers/postgresql");
      const { pushSchema } = await import("drizzle-kit/api");

      containerInstance = await new PostgreSqlContainer()
        .withDatabase('testdb')
        .withUsername('test')
        .withPassword('test')
        .start();

      const { Client } = await import('pg');
      const client = new Client({
        host: containerInstance.getHost(),
        port: containerInstance.getPort(),
        user: containerInstance.getUsername(),
        password: containerInstance.getPassword(),
        database: containerInstance.getDatabase(),
      });

      await client.connect();
      const db = drizzle(client);

      // Brand new db has no schema, push all schema
     // await pushSchema(schema, db);

      dbInstance = db;
      return dbInstance;
    } catch (error) {
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
      return dbInstance;
    } catch (error) {
      console.error("[Database] Error initializing Neon connection:", error);
      throw error;
    }
  }
}

// Export the database instance
export const dbPromise = getDb();
