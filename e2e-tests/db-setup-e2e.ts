import { migrate } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { spawnSync } from "child_process";

async function main() {
  try {
    // Generate migrations before running them
    console.log("[E2E-Setup] Generating migrations with drizzle-kit");
    const genResult = spawnSync("npx", [
      "drizzle-kit",
      "generate",
      "--config",
      "./drizzle-e2e.config.ts"
    ], { stdio: "inherit", shell: true });
    if (genResult.status !== 0) {
      throw new Error(`[E2E-Setup] drizzle-kit generate failed with exit code ${genResult.status}`);
    }
    console.log("[E2E-Setup] Migrations generated successfully");

    console.log("[E2E-Setup] Initializing PGlite for E2E tests");
    // Compute the correct WASM file URL for Node.js
    const path = await import('path');
    const { pathToFileURL } = await import('url');
    const wasmPath = pathToFileURL(
      path.join(process.cwd(), "node_modules/@electric-sql/pglite/dist/pglite.wasm")
    ).href;

    // Initialize PGlite (in-memory) with explicit WASM URL (type assertion to bypass TS error)
    const pgClient = new PGlite({ wasmUrl: wasmPath } as any);
    await pgClient.waitReady;
    console.log("[E2E-Setup] PGlite initialized");

    // Create Drizzle instance
    const db = drizzle(pgClient);

    // Run migrations
    console.log("[E2E-Setup] Running migrations for E2E DB");
    await migrate(db, { migrationsFolder: "./drizzle/e2e-migrations" });
    console.log("[E2E-Setup] Database migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("[E2E-Setup] Setup failed:", error);
    process.exit(1);
  }
}

main();
