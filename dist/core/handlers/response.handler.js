"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const responseHandler = ({ res, status = 200, message = "OK", data = {}, }) => {
    return res.status(status).json({ status, message, data });
};
exports.responseHandler = responseHandler;
