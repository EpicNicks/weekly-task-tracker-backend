const { default: rateLimit } = require('express-rate-limit')


const rateLimitMiddleware = rateLimit({
    windowMs: 3 * 1000,
    limit: 1,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests, please try again later.'
})

module.exports = rateLimitMiddleware