CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT NULL,
  delete_after_first_download BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  management_token_hash TEXT NULL,
  CHECK (status IN ('active', 'expired', 'deleted', 'download_limit_reached'))
);

CREATE INDEX IF NOT EXISTS idx_drops_expires_at ON drops (expires_at);
CREATE INDEX IF NOT EXISTS idx_drops_status ON drops (status);
CREATE INDEX IF NOT EXISTS idx_drops_code ON drops (code);
