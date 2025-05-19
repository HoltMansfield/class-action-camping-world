// Neon PostgreSQL database setup for production/development
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

let neonPool: Pool | null = null;
let dbInstance: any = null;

/**
 * Get a Neon PostgreSQL database instance
 */
export async function getNeonDb() {
  if (dbInstance) return dbInstance;

  try {
    console.log("[Database] Connecting to Neon PostgreSQL");
    
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
