export class AppError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export const errorCodes = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_EXPIRY: 'INVALID_EXPIRY',
  INVALID_DOWNLOAD_LIMIT: 'INVALID_DOWNLOAD_LIMIT',
  DROP_NOT_FOUND: 'DROP_NOT_FOUND',
  DROP_EXPIRED: 'DROP_EXPIRED',
  DROP_DELETED: 'DROP_DELETED',
  DOWNLOAD_LIMIT_REACHED: 'DOWNLOAD_LIMIT_REACHED',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  UNAUTHORIZED_DELETE: 'UNAUTHORIZED_DELETE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INVALID_CODE: 'INVALID_CODE',
};

export const createErrorResponse = (error, fallbackMessage = 'Something went wrong.') => {
  const status = error?.status || 500;
  const code = error?.code || errorCodes.INTERNAL_SERVER_ERROR;
  const message = error?.message || fallbackMessage;

  return {
    success: false,
    error: {
      code,
      message,
    },
  };
};
