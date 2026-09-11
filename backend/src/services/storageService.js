import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';
import { AppError, errorCodes } from '../utils/errors.js';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function uploadFileToStorage(fileBuffer, path, contentType) {
  try {
    const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).upload(path, fileBuffer, {
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

export async function deleteFileFromStorage(storagePath) {
  if (!storagePath) return;

  try {
    const { error } = await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([storagePath]);
    if (error) {
      console.warn('[Storage] Failed to delete file:', storagePath, error.message);
    }
  } catch (error) {
    console.warn('[Storage] Exception deleting file:', storagePath, error.message);
  }
}

export async function getSignedDownloadUrl(storagePath, expiresInSeconds = 60) {
  try {
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
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

export default {
  uploadFileToStorage,
  deleteFileFromStorage,
  getSignedDownloadUrl,
};
