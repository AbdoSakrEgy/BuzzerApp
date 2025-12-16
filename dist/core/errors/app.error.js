"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(statusCode, message, options) {
        super(message, options);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
