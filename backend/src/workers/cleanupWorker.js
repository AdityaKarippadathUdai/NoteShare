import cron from 'node-cron';
import env from '../config/env.js';
import { cleanupExpiredDrops } from '../services/dropService.js';

export async function runCleanupOnce() {
  try {
    const result = await cleanupExpiredDrops();
    if (result.found > 0) {
      console.log(`[Cleanup] Found ${result.found} expired drops`);
      console.log(`[Cleanup] Deleted ${result.deleted} files`);
      console.log(`[Cleanup] Updated ${result.updated} records`);
    }
    return result;
  } catch (error) {
    console.error('[Cleanup] Error while cleaning expired drops:', error.message);
    return { found: 0, deleted: 0, updated: 0 };
  }
}

export function startCleanupWorker() {
  const schedule = cron.schedule('*/1 * * * *', async () => {
    await runCleanupOnce();
  });

  schedule.start();
  console.log('[Cleanup] Worker started');
  return schedule;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[Cleanup] Running standalone cleanup worker');
  runCleanupOnce();
}

export default startCleanupWorker;
