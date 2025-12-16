"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = ({ err, req, res, next, }) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: statusCode,
        message: err.message,
        stack: err.stack,
    });
};
exports.errorHandler = errorHandler;
