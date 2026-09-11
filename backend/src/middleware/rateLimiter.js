import rateLimit from 'express-rate-limit';

export const createApiRateLimiter = (windowMs = 60 * 1000, max = 30, message = 'Too many requests. Please try again later.') =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message,
      },
    },
    skipSuccessfulRequests: false,
  });

export const generalLimiter = createApiRateLimiter(60 * 1000, 60, 'Too many requests. Please try again later.');
export const dropCreateLimiter = createApiRateLimiter(60 * 1000, 10, 'Too many drop creation requests. Please wait a moment.');
export const dropLookupLimiter = createApiRateLimiter(60 * 1000, 60, 'Too many lookup requests. Please wait a moment.');
export const verifyLimiter = createApiRateLimiter(60 * 1000, 30, 'Too many password attempts. Please wait a moment.');
export const downloadLimiter = createApiRateLimiter(60 * 1000, 60, 'Too many download requests. Please wait a moment.');
