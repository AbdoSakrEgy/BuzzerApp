"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const response_handler_1 = require("../../core/handlers/response.handler");
const admin_validation_1 = require("./admin.validation");
const auth_module_type_1 = require("../../types/auth.module.type");
const admin_model_1 = require("../../DB/models/admin.model");
class AdminService {
    constructor() { }
    // ============================ deleteAccount ============================
    deleteAccount = async (req, res, next) => {
        const user = res.locals.user;
        const { accountId, accountType } = req.body;
        // step: check account existence
        if (accountType == auth_module_type_1.RegisterEnum.ADMIN) {
            await admin_model_1.Admin.destroy({ where: { id: accountId } });
        }
        else if (accountType == auth_module_type_1.RegisterEnum.CUSTOMER) {
        }
        else if (accountType == auth_module_type_1.RegisterEnum.CAFE) {
        }
        else if (accountType == auth_module_type_1.RegisterEnum.RESTAURENT) {
        }
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.OK,
            message: "Account deleted successfully",
            data: {},
        });
    };
    // ============================ uploadProfileImage ============================
    uploadProfileImage = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = admin_validation_1.uploadProfileImageSchema.safeParse({
            ...req.body,
            profileImage: req.file,
        });
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        // step: upload image
        const Key = await (0, S3_services_1.uploadSingleSmallFileS3)({
            dest: `admins/${user.id}/profileImage`,
            fileFromMulter: req.file,
        });
        // step: update user
        await admin_model_1.Admin.update({ profileImage: Key }, { where: { id: user.id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Profile image uploaded successfully",
            data: { Key },
        });
    };
    // ============================ updateBasicInfo ============================
    updateBasicInfo = async (req, res, next) => {
        const user = res.locals.user;
        const { fullName, age, gender, email } = req.body;
        // step: check email validation
        if (email) {
            const existingAdmin = await admin_model_1.Admin.findOne({ where: { email } });
            if (existingAdmin && existingAdmin.get("id") !== user.id) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Email already exists");
            }
        }
        // step: update basic info
        const updatedAdmin = await admin_model_1.Admin.update({ fullName, age, gender }, { where: { id: user.id } });
        if (!updatedAdmin) {
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Error while update admin",
                status: 500,
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Admin updated successfully",
            data: { admin: updatedAdmin },
        });
    };
}
exports.AdminService = AdminService;
