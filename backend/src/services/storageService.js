import { supabase, storageBucket } from '../config/supabase.js';
import { AppError, errorCodes } from '../utils/errors.js';

export async function uploadFile(fileBuffer, path, contentType) {
  try {
    const { error } = await supabase.storage.from(storageBucket).upload(path, fileBuffer, {
      contentType,
      upsert: false,
      cacheControl: '3600',
    });

    if (error) {
      throw new AppError(errorCodes.STORAGE_ERROR, error.message || 'File upload failed.', 500);
    }

    return { path };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(errorCodes.STORAGE_ERROR, 'Storage upload failed.', 500);
  }
}

export async function deleteFile(storagePath) {
  if (!storagePath) return;

  try {
    const { error } = await supabase.storage.from(storageBucket).remove([storagePath]);
    if (error) {
      console.warn('[Storage] Failed to delete file:', storagePath, error.message);
    }
  } catch (error) {
    console.warn('[Storage] Exception deleting file:', storagePath, error.message);
  }
}

export async function createSignedDownloadUrl(storagePath, expiresInSeconds = 60) {
  try {
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new AppError(errorCodes.STORAGE_ERROR, 'Failed to generate download URL.', 500);
    }

    return data.signedUrl;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(errorCodes.STORAGE_ERROR, 'File download failed.', 500);
  }
}

export const uploadFileToStorage = uploadFile;
export const deleteFileFromStorage = deleteFile;
export const getSignedDownloadUrl = createSignedDownloadUrl;

export default {
  uploadFile,
  deleteFile,
  createSignedDownloadUrl,
  uploadFileToStorage,
  deleteFileFromStorage,
  getSignedDownloadUrl,
};
