import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import dropRoutes from './routes/dropRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-management-token', 'x-drop-password'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/drops', dropRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
