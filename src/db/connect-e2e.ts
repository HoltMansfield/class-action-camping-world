import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "@/env";

let db: NodePgDatabase<typeof schema> | null = null;

if (env.APP_ENV === "E2E") {
  // Connect to the Docker Postgres database
  const pool = new Pool({ connectionString: env.DB_URL });
  db = drizzle(pool, { schema });
}

export default db;
