import rateLimit from 'express-rate-limit';

/**
 * Global Rate Limiter: 300 requests per 15 minutes window
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});

/**
 * Auth Rate Limiter: 10 failed login/register attempts per 15 minutes window
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

/**
 * Administrative Actions Limiter: 60 requests per 5 minutes
 */
export const adminRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Admin action limit exceeded. Please wait a moment.'
  }
});

export default {
  globalRateLimiter,
  authRateLimiter,
  adminRateLimiter
};
