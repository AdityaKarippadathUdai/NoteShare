import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'FRONTEND_URL',
];

for (const variableName of requiredVariables) {
  if (!process.env[variableName]?.trim()) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

if (!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(process.env.SUPABASE_URL.trim())) {
  throw new Error('Invalid SUPABASE_URL. Use the Supabase project API URL, such as https://your-project.supabase.co.');
}

const normalizePostgresUrl = (connectionString) => connectionString.replace(/#/g, '%23');

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8000),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL.trim(),
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY.trim(),
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET.trim(),
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB || 50),
  CLEANUP_INTERVAL_MS: Number(process.env.CLEANUP_INTERVAL_MS || 60000),
  DATABASE_URL: normalizePostgresUrl(process.env.DATABASE_URL.trim()),
  DIRECT_URL: normalizePostgresUrl(process.env.DIRECT_URL.trim()),
};

console.log('[Config] Environment configuration loaded');
console.log('[Config] Database configuration loaded');
console.log(`[Config] Storage bucket: ${env.SUPABASE_STORAGE_BUCKET}`);
console.log('[Config] Supabase configuration loaded');

export default env;
