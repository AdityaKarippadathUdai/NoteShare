import apiClient from './api';
import { normalizeCode } from '../utils/formatUtils';
import {
  mockCreateDrop,
  mockGetDrop,
  mockVerifyPassword,
  mockDownloadDrop,
} from './mockDropStorage';

/**
 * Checks whether mock API mode is enabled based on VITE_USE_MOCK_API environment variable.
 * - Returns true if VITE_USE_MOCK_API is explicitly 'true' or boolean true.
 * - Returns false if VITE_USE_MOCK_API is explicitly 'false' or boolean false.
 * - Defaults to true if no VITE_API_URL is provided, enabling standalone frontend functionality.
 */
export const isMockApiEnabled = () => {
  const envValue = import.meta.env.VITE_USE_MOCK_API;
  if (envValue === 'true' || envValue === true) return true;
  if (envValue === 'false' || envValue === false) return false;
  return !import.meta.env.VITE_API_URL;
};

/**
 * Creates a new drop by uploading a file with configured parameters.
 * Toggles between real backend API and mock data based on VITE_USE_MOCK_API.
 * 
 * @param {Object|FormData} params
 * @param {File} [params.file] - File to upload
 * @param {string} [params.expiresIn] - Expiration duration (e.g. '10m', '30m', '1h', '24h')
 * @param {number|null|string} [params.maxDownloads] - Maximum download limit
 * @param {string|null} [params.password] - Optional encryption password
 * @param {boolean} [params.deleteAfterFirstDownload] - Auto-delete on first retrieve
 * @param {(percent: number) => void} [onUploadProgress] - Optional upload progress callback
 * @returns {Promise<Object>} Drop metadata
 */
export async function createDrop(params, onUploadProgress) {
  if (isMockApiEnabled()) {
    return mockCreateDrop(params, onUploadProgress);
  }

  let formData;
  if (params instanceof FormData) {
    formData = params;
  } else {
    formData = new FormData();
    if (params.file) {
      formData.append('file', params.file);
    }
    if (params.expiresIn) {
      formData.append('expiresIn', params.expiresIn);
    }
    if (params.maxDownloads !== undefined && params.maxDownloads !== null && params.maxDownloads !== 'unlimited') {
      formData.append('maxDownloads', String(params.maxDownloads));
    }
    if (params.password && params.password.trim().length > 0) {
      formData.append('password', params.password.trim());
    }
    if (params.deleteAfterFirstDownload) {
      formData.append('deleteAfterFirstDownload', 'true');
    }
  }

  const response = await apiClient.post('/drops', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && typeof onUploadProgress === 'function') {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
}

/**
 * Retrieves drop metadata by code.
 * Toggles between real backend API and mock data based on VITE_USE_MOCK_API.
 * 
 * @param {string} code - 6-character drop code
 * @returns {Promise<Object>}
 */
export async function getDrop(code) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  if (isMockApiEnabled()) {
    return mockGetDrop(cleanCode);
  }

  const response = await apiClient.get(`/drops/${cleanCode}`);
  return response.data;
}

/**
 * Verifies password for a password-protected drop.
 * Toggles between real backend API and mock data based on VITE_USE_MOCK_API.
 * 
 * @param {string} code - 6-character drop code
 * @param {string} password - User entered password
 * @returns {Promise<Object>}
 */
export async function verifyPassword(code, password) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  if (isMockApiEnabled()) {
    return mockVerifyPassword(cleanCode, password);
  }

  const response = await apiClient.post(`/drops/${cleanCode}/verify`, { password });
  return response.data;
}

/**
 * Requests and downloads the drop file.
 * Toggles between real backend API and mock data based on VITE_USE_MOCK_API.
 * 
 * @param {string} code - 6-character drop code
 * @param {string|null} [password] - Optional password if protected
 * @returns {Promise<Object>}
 */
export async function downloadDrop(code, password = null) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  if (isMockApiEnabled()) {
    return mockDownloadDrop(cleanCode, password);
  }

  const response = await apiClient.get(`/drops/${cleanCode}/download`, {
    params: password ? { password } : {},
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header if available
  let filename = 'downloaded-file';
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  // Trigger browser download
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);

  return {
    success: true,
    filename,
  };
}

export const dropService = {
  createDrop,
  getDrop,
  verifyPassword,
  downloadDrop,
  isMockApiEnabled,
};

export default dropService;
