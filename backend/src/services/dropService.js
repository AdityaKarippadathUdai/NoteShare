import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import pg from 'pg';
import env from '../config/env.js';
import { AppError, errorCodes } from '../utils/errors.js';
import { generateUniqueDropCode } from '../utils/generateCode.js';
import { sanitizeFilename, getMimeTypeFromExtension } from '../utils/fileUtils.js';
import { deleteFileFromStorage, getSignedDownloadUrl, uploadFileToStorage } from './storageService.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const EXPIRY_MAP = {
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

export function getExpiryMilliseconds(expiresIn) {
  const value = String(expiresIn || '').trim();
  const milliseconds = EXPIRY_MAP[value];
  if (!milliseconds) {
    throw new AppError(errorCodes.INVALID_EXPIRY, 'Invalid expiry value. Allowed: 10m, 30m, 1h, 24h.', 400);
  }
  return milliseconds;
}

export async function getDropByCode(code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    throw new AppError(errorCodes.DROP_NOT_FOUND, 'Drop not found.', 404);
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM drops WHERE code = $1 LIMIT 1`,
      [normalized]
    );

    if (!rows[0]) {
      throw new AppError(errorCodes.DROP_NOT_FOUND, 'Drop not found.', 404);
    }

    return rows[0];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(errorCodes.DATABASE_ERROR, 'Unable to load drop.', 500);
  }
}

export function escapeStoragePath(value) {
  return sanitizeFilename(value || '').replace(/\/+/, '/');
}

export function generateStorageFileName(originalName) {
  const base = crypto.randomBytes(16).toString('hex');
  const ext = originalName ? String(originalName).split('.').pop().toLowerCase() : 'bin';
  return `${base}.${ext}`;
}

export function computeExpiresAt(expiresIn) {
  return new Date(Date.now() + getExpiryMilliseconds(expiresIn)).toISOString();
}

export function buildDropResponse(drop) {
  const response = {
    code: drop.code,
    originalFilename: drop.original_filename,
    fileSize: Number(drop.file_size),
    fileType: drop.mime_type,
    createdAt: drop.created_at,
    expiresAt: drop.expires_at,
    maxDownloads: drop.max_downloads === null || drop.max_downloads === undefined ? null : Number(drop.max_downloads),
    downloadCount: Number(drop.download_count || 0),
    hasPassword: Boolean(drop.password_hash),
    deleteAfterFirstDownload: Boolean(drop.delete_after_first_download),
    status: drop.status,
    requiresPassword: Boolean(drop.password_hash),
  };

  return response;
}

export async function createDropRecord({ file, expiresIn, maxDownloads, password, deleteAfterFirstDownload }) {
  if (!file) {
    throw new AppError(errorCodes.UPLOAD_FAILED, 'No file provided.', 400);
  }

  const originalName = String(file.originalname || 'downloaded-file');
  const safeOriginalName = sanitizeFilename(originalName);
  const mimeType = getMimeTypeFromExtension(safeOriginalName) || file.mimetype || 'application/octet-stream';
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.pptx', '.txt', '.zip'];
  const extension = originalName.includes('.') ? `.${String(originalName.split('.').pop()).toLowerCase()}` : '';

  if (!allowedExtensions.includes(extension)) {
    throw new AppError(errorCodes.INVALID_FILE_TYPE, 'Unsupported file type.', 415);
  }

  if (file.size > env.MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new AppError(errorCodes.FILE_TOO_LARGE, 'File exceeds the 50 MB limit.', 413);
  }

  const parsedLimit = maxDownloads === undefined || maxDownloads === null || maxDownloads === 'unlimited' ? null : Number(maxDownloads);
  if (parsedLimit !== null && (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50)) {
    throw new AppError(errorCodes.INVALID_DOWNLOAD_LIMIT, 'Invalid download limit. Allowed values: 1-50 or unlimited.', 400);
  }

  const expiryMs = getExpiryMilliseconds(expiresIn);
  const expiresAt = new Date(Date.now() + expiryMs).toISOString();

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;
  const storedFilename = `${crypto.randomBytes(16).toString('hex')}${extension || '.bin'}`;
  const storagePath = `drops/${storedFilename}`;

  await uploadFileToStorage(file.buffer, storagePath, mimeType);

  const code = await generateUniqueDropCode(await getAllDropCodes());
  const id = randomUUID();

  try {
    const managementToken = crypto.randomBytes(24).toString('hex');
    const managementHash = await bcrypt.hash(managementToken, 12);

    await pool.query(
      `INSERT INTO drops (
        id, code, original_filename, stored_filename, storage_path, mime_type, file_size, created_at, expires_at,
        max_downloads, download_count, password_hash, delete_after_first_download, status, management_token_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, 0, $10, $11, 'active', $12)`,
      [
        id,
        code,
        safeOriginalName,
        storedFilename,
        storagePath,
        mimeType,
        file.size,
        expiresAt,
        parsedLimit,
        passwordHash,
        deleteAfterFirstDownload === true || deleteAfterFirstDownload === 'true',
        managementHash,
      ]
    );

    return {
      success: true,
      drop: {
        code,
        originalFilename: safeOriginalName,
        fileSize: file.size,
        fileType: mimeType,
        createdAt: new Date().toISOString(),
        expiresAt,
        maxDownloads: parsedLimit,
        downloadCount: 0,
        hasPassword: Boolean(passwordHash),
        deleteAfterFirstDownload: deleteAfterFirstDownload === true || deleteAfterFirstDownload === 'true',
        status: 'active',
      },
      managementToken,
    };
  } catch (error) {
    await deleteFileFromStorage(storagePath);
    throw new AppError(errorCodes.DATABASE_ERROR, 'Could not save drop metadata.', 500);
  }
}

export async function getAllDropCodes() {
  const { rows } = await pool.query('SELECT code FROM drops');
  return rows.map((row) => row.code);
}

export async function ensureDropState(drop) {
  const now = new Date();
  const expiresAt = new Date(drop.expires_at);
  const limitReached = drop.max_downloads !== null && Number(drop.download_count) >= Number(drop.max_downloads);

  if (drop.status === 'expired' || drop.status === 'deleted' || drop.status === 'download_limit_reached') {
    return drop;
  }

  if (now >= expiresAt) {
    await pool.query("UPDATE drops SET status = 'expired' WHERE id = $1", [drop.id]);
    return { ...drop, status: 'expired' };
  }

  if (limitReached) {
    await pool.query("UPDATE drops SET status = 'download_limit_reached' WHERE id = $1", [drop.id]);
    return { ...drop, status: 'download_limit_reached' };
  }

  return drop;
}

export async function getDropMetadata(code) {
  const drop = await getDropByCode(code);
  const state = await ensureDropState(drop);

  if (state.status === 'expired') {
    throw new AppError(errorCodes.DROP_EXPIRED, 'This drop has expired.', 410);
  }

  if (state.status === 'deleted') {
    throw new AppError(errorCodes.DROP_DELETED, 'This drop has been deleted.', 410);
  }

  if (state.status === 'download_limit_reached') {
    throw new AppError(errorCodes.DOWNLOAD_LIMIT_REACHED, 'This drop has reached its maximum number of downloads.', 403);
  }

  return buildDropResponse(state);
}

export async function verifyDropPassword(code, password) {
  const drop = await getDropByCode(code);
  const state = await ensureDropState(drop);

  if (!state.password_hash) {
    return { success: true, authorized: true };
  }

  const valid = await bcrypt.compare(password || '', state.password_hash);
  if (!valid) {
    throw new AppError(errorCodes.INVALID_PASSWORD, 'Incorrect password.', 401);
  }

  return { success: true, authorized: true };
}

export async function downloadDropFile(code, password = null) {
  const drop = await getDropByCode(code);
  const state = await ensureDropState(drop);

  if (state.status === 'expired') {
    throw new AppError(errorCodes.DROP_EXPIRED, 'This drop has expired.', 410);
  }

  if (state.status === 'deleted') {
    throw new AppError(errorCodes.DROP_DELETED, 'This drop has been deleted.', 410);
  }

  if (state.status === 'download_limit_reached') {
    throw new AppError(errorCodes.DOWNLOAD_LIMIT_REACHED, 'This drop has reached its maximum number of downloads.', 403);
  }

  if (state.password_hash) {
    if (!password) {
      throw new AppError(errorCodes.PASSWORD_REQUIRED, 'Password required to download this file.', 401);
    }
    const valid = await bcrypt.compare(String(password), state.password_hash);
    if (!valid) {
      throw new AppError(errorCodes.INVALID_PASSWORD, 'Incorrect password.', 401);
    }
  }

  const signedUrl = await getSignedDownloadUrl(state.storage_path, 120);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, download_count, max_downloads, delete_after_first_download, status, expires_at
       FROM drops
       WHERE id = $1 FOR UPDATE`,
      [state.id]
    );

    const current = rows[0];
    if (!current) {
      throw new AppError(errorCodes.DROP_NOT_FOUND, 'Drop not found.', 404);
    }

    const expiresAt = new Date(current.expires_at);
    const now = new Date();
    if (now >= expiresAt) {
      await client.query("UPDATE drops SET status = 'expired' WHERE id = $1", [current.id]);
      throw new AppError(errorCodes.DROP_EXPIRED, 'This drop has expired.', 410);
    }

    const currentDownloads = Number(current.download_count || 0);
    const maxDownloads = current.max_downloads === null || current.max_downloads === undefined ? null : Number(current.max_downloads);
    if (maxDownloads !== null && currentDownloads >= maxDownloads) {
      await client.query("UPDATE drops SET status = 'download_limit_reached' WHERE id = $1", [current.id]);
      throw new AppError(errorCodes.DOWNLOAD_LIMIT_REACHED, 'This drop has reached its maximum number of downloads.', 403);
    }

    const nextCount = currentDownloads + 1;
    await client.query(
      `UPDATE drops SET download_count = $1, status = $2 WHERE id = $3`,
      [nextCount, maxDownloads !== null && nextCount >= maxDownloads ? 'download_limit_reached' : 'active', current.id]
    );

    if (current.delete_after_first_download) {
      await client.query(
        `UPDATE drops SET status = 'deleted' WHERE id = $1`,
        [current.id]
      );
      await deleteFileFromStorage(current.storage_path);
    }

    await client.query('COMMIT');

    return {
      success: true,
      signedUrl,
      filename: state.original_filename,
      fileType: state.mime_type,
      downloadCount: nextCount,
      remainingDownloads: maxDownloads === null ? null : Math.max(0, maxDownloads - nextCount),
      deleteAfterFirstDownload: Boolean(current.delete_after_first_download),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
    console.error('[Download] Database operation failed:', error.message);
    throw new AppError(errorCodes.DATABASE_ERROR, 'Download failed.', 500);
  } finally {
    client.release();
  }
}

export async function deleteDrop(code, managementToken) {
  const drop = await getDropByCode(code);
  if (!drop) {
    throw new AppError(errorCodes.DROP_NOT_FOUND, 'Drop not found.', 404);
  }

  if (!drop.management_token_hash) {
    throw new AppError(errorCodes.UNAUTHORIZED_DELETE, 'Unable to authorize deletion.', 403);
  }

  const validToken = await bcrypt.compare(managementToken || '', drop.management_token_hash);
  if (!validToken) {
    throw new AppError(errorCodes.UNAUTHORIZED_DELETE, 'Invalid management token.', 403);
  }

  await deleteFileFromStorage(drop.storage_path);
  await pool.query("UPDATE drops SET status = 'deleted', expires_at = NOW() WHERE id = $1", [drop.id]);

  return { success: true, message: 'Drop deleted successfully.' };
}

export async function cleanupExpiredDrops() {
  const { rows } = await pool.query(
    `SELECT * FROM drops WHERE status = 'active' AND expires_at <= NOW() LIMIT 100`
  );

  if (!rows.length) {
    return { found: 0, deleted: 0, updated: 0 };
  }

  let deletedFiles = 0;
  let updatedRecords = 0;

  for (const drop of rows) {
    try {
      await deleteFileFromStorage(drop.storage_path);
      deletedFiles += 1;
    } catch (error) {
      console.warn('[Cleanup] Failed to delete file:', drop.storage_path, error.message);
    }

    try {
      await pool.query("UPDATE drops SET status = 'expired' WHERE id = $1", [drop.id]);
      updatedRecords += 1;
    } catch (error) {
      console.warn('[Cleanup] Failed to update drop:', drop.id, error.message);
    }
  }

  return {
    found: rows.length,
    deleted: deletedFiles,
    updated: updatedRecords,
  };
}

export default {
  createDropRecord,
  getDropMetadata,
  verifyDropPassword,
  downloadDropFile,
  deleteDrop,
  cleanupExpiredDrops,
  getDropByCode,
  pool,
};
