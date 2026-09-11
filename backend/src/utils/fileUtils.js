import path from 'path';

const allowedMimeTypes = new Map([
  ['application/pdf', '.pdf'],
  ['application/msword', '.doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx'],
  ['text/plain', '.txt'],
  ['application/zip', '.zip'],
  ['application/x-zip-compressed', '.zip'],
  ['application/vnd.ms-excel', '.xls'],
  ['application/x-tar', '.tar'],
]);

const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.pptx', '.txt', '.zip']);

export function sanitizeFilename(filename = '') {
  const base = path.basename(filename || '').trim();
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function buildSafeStoragePath(originalName, generatedName) {
  const safeOriginal = sanitizeFilename(originalName);
  const safeGenerated = sanitizeFilename(generatedName);
  if (!safeOriginal || !safeGenerated) {
    throw new Error('Invalid filename for storage path.');
  }
  const ext = path.extname(safeGenerated) || path.extname(safeOriginal) || '';
  return `drops/${safeGenerated}${ext}`;
}

export function isAllowedFile(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const mimeType = file.mimetype || '';

  if (!allowedExtensions.has(extension)) {
    return false;
  }

  const normalizedMime = mimeType.toLowerCase();
  const allowedType = allowedMimeTypes.has(normalizedMime);
  const extensionMatchesMime = extension === allowedMimeTypes.get(normalizedMime);

  return allowedType && extensionMatchesMime;
}

export function getMimeTypeFromExtension(filename) {
  const ext = path.extname(filename || '').toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
  };

  return map[ext] || 'application/octet-stream';
}

export function isExecutableFile(file) {
  const name = (file.originalname || '').toLowerCase();
  return /\.(exe|bat|cmd|com|scr|js|jar|msi|sh|ps1|app|apk|dll)$/i.test(name);
}
