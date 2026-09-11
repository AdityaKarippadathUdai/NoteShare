import { AppError, createErrorResponse, errorCodes } from '../utils/errors.js';
import { validateExpiry, validateMaxDownloads, validatePassword, normalizeDropCode } from '../middleware/validateDrop.js';
import { createDropRecord, getDropMetadata, verifyDropPassword, downloadDropFile, deleteDrop } from '../services/dropService.js';

export async function createDrop(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(errorCodes.UPLOAD_FAILED, 'A file is required.', 400);
    }

    const expiresIn = req.body.expiresIn;
    const maxDownloads = req.body.maxDownloads;
    const password = validatePassword(req.body.password);
    const deleteAfterFirstDownload = req.body.deleteAfterFirstDownload === 'true' || req.body.deleteAfterFirstDownload === true;

    validateExpiry(expiresIn);
    validateMaxDownloads(maxDownloads, deleteAfterFirstDownload);

    const result = await createDropRecord({
      file: req.file,
      expiresIn,
      maxDownloads,
      password,
      deleteAfterFirstDownload,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(errorCodes.FILE_TOO_LARGE, 'File exceeds the 50 MB limit.', 413));
    }
    if (error?.code === 'INVALID_FILE_TYPE') {
      return next(new AppError(errorCodes.INVALID_FILE_TYPE, 'Unsupported file type.', 415));
    }
    return next(error);
  }
}

export async function getDrop(req, res, next) {
  try {
    const code = normalizeDropCode(req.params.code);
    const drop = await getDropMetadata(code);
    return res.status(200).json(drop);
  } catch (error) {
    next(error);
  }
}

export async function verifyPassword(req, res, next) {
  try {
    const code = normalizeDropCode(req.params.code);
    const password = String(req.body.password || '');

    if (!password.trim()) {
      throw new AppError(errorCodes.INVALID_PASSWORD, 'Password is required.', 400);
    }

    const result = await verifyDropPassword(code, password);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadDrop(req, res, next) {
  try {
    const code = normalizeDropCode(req.params.code);
    const password = req.query.password ? String(req.query.password) : null;

    const result = await downloadDropFile(code, password);

    const response = await fetch(result.signedUrl);
    if (!response.ok) {
      throw new AppError(errorCodes.STORAGE_ERROR, 'Unable to load file from storage.', 500);
    }

    const fileBuffer = Buffer.from(await response.arrayBuffer());
    const fileName = result.filename || 'downloaded-file';

    res.setHeader('Content-Type', result.fileType || 'application/octet-stream');
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '')}"`);
    return res.status(200).send(fileBuffer);
  } catch (error) {
    next(error);
  }
}

export async function deleteDropByCode(req, res, next) {
  try {
    const code = normalizeDropCode(req.params.code);
    const managementToken = req.body.managementToken || req.headers['x-management-token'];

    if (!managementToken) {
      throw new AppError(errorCodes.UNAUTHORIZED_DELETE, 'Management token is required.', 403);
    }

    const result = await deleteDrop(code, managementToken);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export default {
  createDrop,
  getDrop,
  verifyPassword,
  downloadDrop,
  deleteDropByCode,
};
