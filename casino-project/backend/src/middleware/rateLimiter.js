// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'محاولات تسجيل دخول كثيرة. حاول بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});

const gameLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: { success: false, message: 'طلبات كثيرة جداً. أبطئ قليلاً' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'حد الطلبات تجاوز. حاول بعد دقيقة' },
});

const videoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: 'لا يمكنك مشاهدة أكثر من 3 فيديوهات في الدقيقة' },
});

module.exports = { authLimiter, gameLimiter, apiLimiter, videoLimiter };
