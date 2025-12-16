"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const http_status_code_1 = require("../http/http.status.code");
const app_error_1 = require("../errors/app.error");
const validation = (shcema) => {
    return (req, res, next) => {
        const data = {
            ...req.body,
            ...req.params,
            ...req.query,
            // express.json() can't see or parssing fields that has files, so we create this field and put data in it manually
            // profileImage: req.file,
            // attachment: req.file,
            // attachments: req.files,
        };
        const result = shcema.safeParse(data);
        if (!result.success) {
            const issues = result.error?.issues;
            let messages = "";
            for (let item of issues) {
                messages += item.message + " ||&&|| ";
            }
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, messages);
        }
        next();
    };
};
exports.validation = validation;
