export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_FILE_SIZE_MB = 50;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.pptx', '.txt', '.zip'];

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
];

/**
 * Formats byte count into human-readable string (KB, MB, etc.).
 * 
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatFileSize(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '—';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Validates a file against allowed extensions and size limits.
 * 
 * @param {File} file 
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 50 MB limit (${formatFileSize(file.size)}).`,
    };
  }

  const name = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: 'Unsupported file type. Allowed formats: PDF, DOC, DOCX, PPTX, TXT, ZIP.',
    };
  }

  return { valid: true, error: null };
}

/**
 * Returns a simplified type label based on file name or MIME type.
 * 
 * @param {string} filename 
 * @param {string} [mimeType] 
 * @returns {string}
 */
export function getFileTypeLabel(filename = '', mimeType = '') {
  const name = filename.toLowerCase();
  if (name.endsWith('.pdf') || mimeType === 'application/pdf') return 'PDF';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'Word Document';
  if (name.endsWith('.pptx')) return 'PowerPoint Presentation';
  if (name.endsWith('.txt')) return 'Plain Text';
  if (name.endsWith('.zip')) return 'ZIP Archive';
  return 'Document';
}

/**
 * Returns a short uppercase extension badge e.g. "PDF", "ZIP".
 * 
 * @param {string} filename 
 * @returns {string}
 */
export function getFileBadge(filename = '') {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop().toUpperCase();
  }
  return 'FILE';
}
