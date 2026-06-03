import rateLimit from 'express-rate-limit';

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // limit each IP to 10 uploads per window
  message: 'Too many upload attempts. Please try again later.',
});


export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: 'Too many chat messages. Please try again later.'
});