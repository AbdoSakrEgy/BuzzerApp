"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const error_handler_1 = require("../handlers/error.handler");
const errorMiddleware = (err, req, res, next) => {
    (0, error_handler_1.errorHandler)({ err, req, res, next });
};
exports.errorMiddleware = errorMiddleware;
