// E2E testing database setup with TestContainers
import 'server-only';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

// Store container instance for cleanup
let containerInstance: StartedPostgreSqlContainer | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;
let pgClient: Client | null = null;

/**
 * Get a PostgreSQL database instance for E2E testing
 */
export async function getE2EDb(): Promise<NodePgDatabase<typeof schema>> {
  if (dbInstance) return dbInstance;

  try {
    // Create a new PostgreSQL container
    const container = new PostgreSqlContainer()
      .withDatabase('testdb')
      .withUsername('test')
      .withPassword('test');
    
    // Start the container and store the started instance
    containerInstance = await container.start();

    // Connect to the container
    pgClient = new Client({
      host: containerInstance.getHost(),
      port: containerInstance.getPort(),
      user: containerInstance.getUsername(),
      password: containerInstance.getPassword(),
      database: containerInstance.getDatabase(),
    });

    await pgClient.connect();
    const db = drizzle(pgClient, { schema });

    // Create schema directly with SQL instead of using pushSchema
    // This avoids module compatibility issues with drizzle-kit/api
    await db.execute(sql`
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        email_verified TIMESTAMP WITH TIME ZONE,
        password TEXT,
        image TEXT
      );
      
      -- Create sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL
      );
      
      -- Create verification tokens table
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `);

    dbInstance = db;
    return dbInstance;
  } catch (error) {
    console.error('[E2E Database] Error initializing PostgreSQL container:', error);
    throw error;
  }
}

/**
 * Stop the E2E database container and clean up resources
 */
export async function stopE2EDb() {
  if (containerInstance) {
    console.log('[E2E Database] Stopping PostgreSQL container');
    await containerInstance.stop();
    containerInstance = null;
  }
  
  if (pgClient) {
    // Close the PostgreSQL client connection
    await pgClient.end();
    pgClient = null;
  }
  
  dbInstance = null;
}

// Add a cleanup handler for tests
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await stopE2EDb();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await stopE2EDb();
    process.exit(0);
  });
}
