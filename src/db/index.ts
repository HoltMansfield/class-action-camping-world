import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from "dotenv";
import { existsSync } from "fs";
import { join } from "path";

// Try to load e2e.env or .env.local if present (for local/dev/test)
const e2eEnvPath = join(process.cwd(), "database/e2e.env");
const localEnvPath = join(process.cwd(), ".env.local");

if (existsSync(e2eEnvPath)) dotenv.config({ path: e2eEnvPath });
else if (existsSync(localEnvPath)) dotenv.config({ path: localEnvPath });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
