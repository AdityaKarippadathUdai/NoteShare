import { generateRandomCode, normalizeCode } from '../utils/formatUtils';

/**
 * In-memory and session-backed mock drop registry.
 * Completely isolated from production API client code.
 */
const STORAGE_KEY = 'notedrop_mock_storage_v1';
const fileBlobCache = new Map();

// Helper to seed initial sample drop for direct previewing if empty
function initializeSeedData() {
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const sampleExpiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
    const sampleDrop = {
      id: 'demo-drop-uuid-001',
      code: '7KQ92P',
      originalFilename: 'Operating Systems Notes.pdf',
      fileSize: 4200000,
      fileType: 'application/pdf',
      expiresAt: sampleExpiresAt,
      maxDownloads: 3,
      downloadCount: 0,
      hasPassword: false,
      password: null,
      deleteAfterFirstDownload: false,
      downloadUrl: '/api/drops/7KQ92P/download',
      mockContentText: 'Sample temporary file contents for NoteDrop demo.',
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([sampleDrop]));
  }
}

initializeSeedData();

function getAllDrops() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAllDrops(drops) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
  } catch (err) {
    console.warn('Failed to save mock drops to sessionStorage', err);
  }
}

/**
 * Calculate expiry date from string representation.
 */
function calculateExpiresAt(expiresIn) {
  const now = Date.now();
  switch (expiresIn) {
    case '10m':
    case '10 minutes':
      return new Date(now + 10 * 60 * 1000).toISOString();
    case '1h':
    case '1 hour':
      return new Date(now + 60 * 60 * 1000).toISOString();
    case '24h':
    case '24 hours':
      return new Date(now + 24 * 60 * 60 * 1000).toISOString();
    case '30m':
    case '30 minutes':
    default:
      return new Date(now + 30 * 60 * 1000).toISOString();
  }
}

/**
 * Simulates POST /drops
 */
export async function mockCreateDrop(payload, onProgress) {
  // Simulate progress callback
  if (typeof onProgress === 'function') {
    for (let percent = 10; percent <= 90; percent += 25) {
      await new Promise((r) => setTimeout(r, 60));
      onProgress(percent);
    }
  }

  await new Promise((r) => setTimeout(r, 200));

  let file, expiresIn, maxDownloads, password, deleteAfterFirstDownload;

  if (payload instanceof FormData) {
    file = payload.get('file');
    expiresIn = payload.get('expiresIn') || '30m';
    const rawLimit = payload.get('maxDownloads');
    maxDownloads = rawLimit === 'unlimited' || !rawLimit ? null : parseInt(rawLimit, 10);
    password = payload.get('password') || null;
    deleteAfterFirstDownload = payload.get('deleteAfterFirstDownload') === 'true';
  } else {
    file = payload.file;
    expiresIn = payload.expiresIn || '30m';
    maxDownloads = payload.maxDownloads === 'unlimited' ? null : Number(payload.maxDownloads) || null;
    password = payload.password || null;
    deleteAfterFirstDownload = Boolean(payload.deleteAfterFirstDownload);
  }

  if (typeof onProgress === 'function') {
    onProgress(100);
  }

  const code = generateRandomCode();
  const id = `drop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = calculateExpiresAt(expiresIn);

  // Store file blob if actual File object is provided
  if (file && file instanceof Blob) {
    fileBlobCache.set(code, file);
  }

  const newDrop = {
    id,
    code,
    originalFilename: file ? file.name : 'Document.pdf',
    fileSize: file ? file.size : 1024 * 512,
    fileType: file ? file.type || 'application/octet-stream' : 'application/pdf',
    expiresAt,
    maxDownloads: maxDownloads || (deleteAfterFirstDownload ? 1 : null),
    downloadCount: 0,
    hasPassword: Boolean(password && password.trim().length > 0),
    password: password || null,
    deleteAfterFirstDownload: Boolean(deleteAfterFirstDownload),
    downloadUrl: `/api/drops/${code}/download`,
  };

  const drops = getAllDrops();
  drops.push(newDrop);
  saveAllDrops(drops);

  return {
    id: newDrop.id,
    code: newDrop.code,
    originalFilename: newDrop.originalFilename,
    fileSize: newDrop.fileSize,
    fileType: newDrop.fileType,
    expiresAt: newDrop.expiresAt,
    maxDownloads: newDrop.maxDownloads,
    downloadCount: newDrop.downloadCount,
    hasPassword: newDrop.hasPassword,
    downloadUrl: newDrop.downloadUrl,
  };
}

/**
 * Simulates GET /drops/:code
 */
export async function mockGetDrop(rawCode) {
  await new Promise((r) => setTimeout(r, 200));
  const code = normalizeCode(rawCode);
  const drops = getAllDrops();
  const drop = drops.find((d) => d.code === code);

  if (!drop) {
    const err = new Error("The code you entered doesn't exist or is no longer available.");
    err.status = 404;
    err.code = 'DROP_NOT_FOUND';
    throw err;
  }

  // Check expiration
  if (new Date(drop.expiresAt).getTime() <= Date.now()) {
    const err = new Error('This file was automatically removed after its expiration time.');
    err.status = 410;
    err.code = 'DROP_EXPIRED';
    throw err;
  }

  // Check download limit
  if (drop.maxDownloads !== null && drop.downloadCount >= drop.maxDownloads) {
    const err = new Error('This drop has reached its maximum number of downloads.');
    err.status = 403;
    err.code = 'LIMIT_REACHED';
    throw err;
  }

  if (drop.hasPassword) {
    return {
      code: drop.code,
      requiresPassword: true,
      hasPassword: true,
      originalFilename: drop.originalFilename,
      fileSize: drop.fileSize,
      fileType: drop.fileType,
      expiresAt: drop.expiresAt,
      downloadCount: drop.downloadCount,
      maxDownloads: drop.maxDownloads,
    };
  }

  return {
    code: drop.code,
    originalFilename: drop.originalFilename,
    fileSize: drop.fileSize,
    fileType: drop.fileType,
    expiresAt: drop.expiresAt,
    downloadCount: drop.downloadCount,
    maxDownloads: drop.maxDownloads,
    hasPassword: false,
    requiresPassword: false,
  };
}

/**
 * Simulates POST /drops/:code/verify
 */
export async function mockVerifyPassword(rawCode, password) {
  await new Promise((r) => setTimeout(r, 250));
  const code = normalizeCode(rawCode);
  const drops = getAllDrops();
  const drop = drops.find((d) => d.code === code);

  if (!drop) {
    const err = new Error('Drop not found.');
    err.status = 404;
    err.code = 'DROP_NOT_FOUND';
    throw err;
  }

  if (drop.password !== password) {
    const err = new Error('Incorrect password. Please try again.');
    err.status = 401;
    err.code = 'INCORRECT_PASSWORD';
    throw err;
  }

  return {
    code: drop.code,
    originalFilename: drop.originalFilename,
    fileSize: drop.fileSize,
    fileType: drop.fileType,
    expiresAt: drop.expiresAt,
    downloadCount: drop.downloadCount,
    maxDownloads: drop.maxDownloads,
    hasPassword: true,
    verified: true,
  };
}

/**
 * Simulates GET /drops/:code/download
 */
export async function mockDownloadDrop(rawCode, password) {
  await new Promise((r) => setTimeout(r, 300));
  const code = normalizeCode(rawCode);
  const drops = getAllDrops();
  const dropIndex = drops.findIndex((d) => d.code === code);

  if (dropIndex === -1) {
    const err = new Error("The code you entered doesn't exist or is no longer available.");
    err.status = 404;
    err.code = 'DROP_NOT_FOUND';
    throw err;
  }

  const drop = drops[dropIndex];

  // Expiration check
  if (new Date(drop.expiresAt).getTime() <= Date.now()) {
    const err = new Error('This file was automatically removed after its expiration time.');
    err.status = 410;
    err.code = 'DROP_EXPIRED';
    throw err;
  }

  // Download limit check
  if (drop.maxDownloads !== null && drop.downloadCount >= drop.maxDownloads) {
    const err = new Error('This drop has reached its maximum number of downloads.');
    err.status = 403;
    err.code = 'LIMIT_REACHED';
    throw err;
  }

  // Password check
  if (drop.hasPassword && drop.password !== password) {
    const err = new Error('Password required to download this file.');
    err.status = 401;
    err.code = 'PASSWORD_REQUIRED';
    throw err;
  }

  // Increment download count
  drop.downloadCount += 1;

  // Check delete after first download
  let willDelete = drop.deleteAfterFirstDownload || (drop.maxDownloads !== null && drop.downloadCount >= drop.maxDownloads);

  if (willDelete) {
    drops.splice(dropIndex, 1);
  } else {
    drops[dropIndex] = drop;
  }
  saveAllDrops(drops);

  // Retrieve cached blob or generate a mock download blob
  let blob = fileBlobCache.get(code);
  if (!blob) {
    const content = drop.mockContentText || `File: ${drop.originalFilename}\nShared securely via NoteDrop.\nDownloaded at: ${new Date().toISOString()}`;
    blob = new Blob([content], { type: drop.fileType || 'application/octet-stream' });
  }

  // Initiate browser file download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = drop.originalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  return {
    success: true,
    originalFilename: drop.originalFilename,
    downloadCount: drop.downloadCount,
    remainingDownloads: drop.maxDownloads !== null ? Math.max(0, drop.maxDownloads - drop.downloadCount) : null,
  };
}
