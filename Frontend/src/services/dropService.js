import apiClient from './api';
import { normalizeCode } from '../utils/formatUtils';

/**
 * Creates a new drop by uploading a file with configured parameters.
 *
 * @param {Object|FormData} params
 * @param {File} [params.file]
 * @param {string} [params.expiresIn]
 * @param {number|null|string} [params.maxDownloads]
 * @param {string|null} [params.password]
 * @param {boolean} [params.deleteAfterFirstDownload]
 * @param {(percent: number) => void} [onUploadProgress]
 * @returns {Promise<Object>}
 */
export async function createDrop(params, onUploadProgress) {
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
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && typeof onUploadProgress === 'function') {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
}

export async function getDrop(code) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  const response = await apiClient.get(`/drops/${cleanCode}`);
  return response.data;
}

export async function verifyPassword(code, password) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  const response = await apiClient.post(`/drops/${cleanCode}/verify`, { password });
  return response.data;
}

export async function downloadDrop(code, password = null) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  const response = await apiClient.get(`/drops/${cleanCode}/download`, {
    params: password ? { password } : {},
    responseType: 'blob',
  });

  let filename = 'downloaded-file';
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

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

export async function deleteDrop(code, managementToken) {
  const cleanCode = normalizeCode(code);
  if (!cleanCode) {
    const error = new Error('Invalid drop code provided.');
    error.status = 400;
    error.code = 'INVALID_CODE';
    throw error;
  }

  const response = await apiClient.delete(`/drops/${cleanCode}`, {
    data: { managementToken },
  });

  return response.data;
}

export const dropService = {
  createDrop,
  getDrop,
  verifyPassword,
  downloadDrop,
  deleteDrop,
};

export default dropService;
