import { AppError, errorCodes } from '../utils/errors.js';

const VALID_EXPIRIES = new Set(['10m', '30m', '1h', '24h']);

export function validateExpiry(expiresIn) {
  if (!expiresIn || !VALID_EXPIRIES.has(String(expiresIn))) {
    throw new AppError(errorCodes.INVALID_EXPIRY, 'Invalid expiry value. Allowed: 10m, 30m, 1h, 24h.', 400);
  }
}

export function validateMaxDownloads(maxDownloads, deleteAfterFirstDownload) {
  if (deleteAfterFirstDownload) {
    return;
  }

  if (maxDownloads === null || maxDownloads === undefined || maxDownloads === 'unlimited') {
    return;
  }

  const parsed = Number(maxDownloads);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
    throw new AppError(errorCodes.INVALID_DOWNLOAD_LIMIT, 'Invalid download limit. Allowed values: 1-50 or unlimited.', 400);
  }
}

export function validatePassword(password) {
  if (password === undefined || password === null || password === '') {
    return null;
  }

  const value = String(password).trim();
  if (value.length < 4 || value.length > 128) {
    throw new AppError('INVALID_PASSWORD', 'Password must be between 4 and 128 characters.', 400);
  }

  return value;
}

export function normalizeDropCode(input) {
  const normalized = String(input || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (!normalized) {
    throw new AppError(errorCodes.INVALID_CODE, 'Invalid drop code.', 400);
  }
  return normalized;
}

export default {
  validateExpiry,
  validateMaxDownloads,
  validatePassword,
  normalizeDropCode,
};
