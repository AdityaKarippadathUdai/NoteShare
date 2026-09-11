import { createErrorResponse } from '../utils/errors.js';

export function notFoundHandler(req, res) {
  return res.status(404).json(createErrorResponse({
    code: 'DROP_NOT_FOUND',
    message: 'Route not found.',
    status: 404,
  }));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong.';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', status, code, message);
  }

  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
