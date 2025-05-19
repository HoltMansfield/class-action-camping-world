import { execSync } from 'child_process';

const dbSetup = async () => {
  // Regenerate migrations
  console.log(`[global-setup] Generating fresh migrations in ./drizzle/e2e-migrations`);
  // Pass E2E_TEST environment variable to drizzle-kit commands
  execSync('E2E_TEST=true npx drizzle-kit generate --config=drizzle-e2e.config.ts', { 
    stdio: 'inherit',
    env: { ...process.env, E2E_TEST: 'true' }
  });

  // Run Drizzle migrations
  console.log(`[global-setup] Pushing migrations to database`);
  execSync('E2E_TEST=true npx drizzle-kit push --config=drizzle-e2e.config.ts', { 
    stdio: 'inherit',
    env: { ...process.env, E2E_TEST: 'true' }
  });
};

dbSetup();