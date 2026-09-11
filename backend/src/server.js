import http from 'http';
import app from './app.js';
import env from './config/env.js';
import { pool } from './services/dropService.js';
import startCleanupWorker from './workers/cleanupWorker.js';

const server = http.createServer(app);

async function startServer() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('[Database] Connected');
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
  }

  server.listen(env.PORT, () => {
    console.log(`Server started on port ${env.PORT}`);
  });

  startCleanupWorker();
}

const shutdown = async (signal) => {
  console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Server] Force exit after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});

startServer();
