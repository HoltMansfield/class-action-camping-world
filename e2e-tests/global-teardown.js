/**
 * Global teardown function for Playwright
 * This will run after all tests are complete
 */
async function globalTeardown() {
  console.log('[global-teardown] Cleaning up resources...');
  
  try {
    // Set the E2E_TEST environment variable to ensure we clean up the right database
    process.env.E2E_TEST = 'true';
    
    // Dynamically import and call stopDb
    const { stopDb } = await import('../src/db/getDb.js');
    await stopDb();
    
    console.log('[global-teardown] Cleanup complete');
  } catch (error) {
    console.error('[global-teardown] Error during cleanup:', error);
  }
}

export default globalTeardown;
