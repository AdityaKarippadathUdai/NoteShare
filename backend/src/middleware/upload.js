import multer from 'multer';
import env from '../config/env.js';
import { AppError, errorCodes } from '../utils/errors.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const name = (file.originalname || '').toLowerCase();
  const allowed = /\.(pdf|doc|docx|pptx|txt|zip)$/i.test(name);

  if (!allowed) {
    return cb(new AppError(errorCodes.INVALID_FILE_TYPE, 'Unsupported file type.', 415));
  }

  return cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});

export default upload;
