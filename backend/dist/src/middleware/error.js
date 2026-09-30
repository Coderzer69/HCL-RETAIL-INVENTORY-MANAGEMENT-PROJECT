"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        console.error('Error handler caught:', err);
    }
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    if (err.name === 'ZodError') {
        statusCode = 400;
        const issues = err.issues || err.errors || [];
        message = 'Validation Error: ' + issues.map((e) => e.message).join(', ');
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};
exports.errorHandler = errorHandler;
