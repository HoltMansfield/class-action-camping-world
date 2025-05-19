// ESM global teardown for Playwright: stop and remove the testcontainer
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DockerClient } from 'testcontainers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalTeardown() {
  console.log('[global-teardown] Cleaning up testcontainer...');
  try {
    const idPath = path.resolve(__dirname, '../.e2e-container-id');
    const containerId = (await fs.readFile(idPath, 'utf-8')).trim();
    const docker = new DockerClient();
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
    await fs.unlink(idPath);
    console.log('[global-teardown] Testcontainer stopped and removed.');
  } catch (err) {
    console.error('[global-teardown] Error during cleanup:', err);
  }
}
