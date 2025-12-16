"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const response_handler_1 = require("../../core/handlers/response.handler");
const admin_validation_1 = require("./admin.validation");
const jwt_1 = require("../../utils/jwt");
const createOtp_1 = require("../../utils/createOtp");
const auth_module_type_1 = require("../../types/auth.module.type");
const admin_model_1 = require("../../DB/models/admin.model");
const decodeToken_1 = require("../../utils/decodeToken");
class AdminService {
    constructor() { }
    // ============================ register ============================
    register = async (req, res, next) => {
        const { phone } = req.body;
        // step: check admin existence
        const checkAdmin = await admin_model_1.Admin.findOne({ where: { phone } });
        if (checkAdmin) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Admin already exist");
        }
        // step: send otp from firebase
        // ????????????????????
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.OK,
            message: `Otp sended to ${phone}`,
            data: {},
        });
    };
    // ============================ login ============================
    login = async (req, res, next) => {
        const { phone } = req.body;
        // step: check admin existence
        const checkAdmin = await admin_model_1.Admin.findOne({ where: { phone } });
        if (!checkAdmin) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Admin not found");
        }
        // step: send otp from firebase
        // ????????????????????
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.OK,
            message: `Otp sended to ${phone}`,
            data: {},
        });
    };
    // ============================ registerCheckOtp ============================
    registerCheckOtp = async (req, res, next) => {
        const { fullName, email, phone, password, otp } = req.body;
        // step: check otp from firebase
        // ????????????????????
        if (false) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid OTP");
        }
        // step: check if email already exists
        const existingAdmin = await admin_model_1.Admin.findOne({ where: { email } });
        if (existingAdmin) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Admin with this email already exists");
        }
        // step: check if phone already exists
        const existingAdminWithPhone = await admin_model_1.Admin.findOne({ where: { phone } });
        if (existingAdminWithPhone) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Admin with this phone already exists");
        }
        // step: create admin
        const admin = await admin_model_1.Admin.create({
            fullName,
            email,
            phone,
            password,
        });
        if (!admin) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "Admin did not created");
        }
        // step: create token
        const accessToken = (0, jwt_1.createJwt)({ userId: admin.get("id"), userType: auth_module_type_1.RegisterEnum.ADMIN }, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        const refreshToken = (0, jwt_1.createJwt)({ userId: admin.get("id"), userType: auth_module_type_1.RegisterEnum.ADMIN }, process.env.REFRESH_SEGNATURE, {
            expiresIn: "7d",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.CREATED,
            message: "Admin created successfully",
            data: { accessToken, refreshToken },
        });
    };
    // ============================ loginCheckOtp ============================
    loginCheckOtp = async (req, res, next) => {
        const { phone, otp } = req.body;
        // step: check otp from firebase
        // ????????????????????
        if (false) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid OTP");
        }
        // step: check admin
        const admin = await admin_model_1.Admin.findOne({ where: { phone } });
        if (!admin) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Admin not found");
        }
        // step: create token
        const accessToken = (0, jwt_1.createJwt)({ userId: admin.get("id"), userType: auth_module_type_1.RegisterEnum.ADMIN }, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        const refreshToken = (0, jwt_1.createJwt)({ userId: admin.get("id"), userType: auth_module_type_1.RegisterEnum.ADMIN }, process.env.REFRESH_SEGNATURE, {
            expiresIn: "7d",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.OK,
            message: "Loggedin successfully",
            data: { accessToken, refreshToken },
        });
    };
    // ============================ refreshToken ============================
    refreshToken = async (req, res, next) => {
        const authorization = req.headers.authorization;
        // step: check authorization
        if (!authorization) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Authorization undefiend");
        }
        // step: decode authorization
        const { user, payload } = await (0, decodeToken_1.decodeToken)({
            authorization,
            tokenType: decodeToken_1.TokenTypesEnum.refresh,
        });
        // step: create accessToken
        const newPayload = {
            userId: payload.userId,
            userType: payload.userType,
        };
        const jwtid = (0, createOtp_1.createOtp)();
        // const jwtid = "666";
        const accessToken = (0, jwt_1.createJwt)(newPayload, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid,
        });
        return (0, response_handler_1.responseHandler)({ res, data: { accessToken } });
    };
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
    // ============================ profile ============================
    profile = async (req, res, next) => {
        const user = res.locals.user;
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.OK,
            data: { user },
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
    // ============================ getFile ============================
    getFile = async (req, res, next) => {
        const path = req.params.path;
        const Key = path.join("/");
        const url = await (0, S3_services_1.createPresignedUrlToGetFileS3)({ Key });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "File URL generated successfully",
            data: { url },
        });
    };
    // ============================ deleteFile ============================
    deleteFile = async (req, res, next) => {
        const path = req.params.path;
        const Key = path.join("/");
        const result = await (0, S3_services_1.deleteFileS3)({ Key });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "File deleted successfully",
        });
    };
    // ============================ deleteMultiFiles ============================
    deleteMultiFiles = async (req, res, next) => {
        const { Keys, Quiet = false } = req.body;
        const result = await (0, S3_services_1.deleteMultiFilesS3)({ Keys, Quiet });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Files deleted successfully",
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
    // ============================ logout ============================
    logout = async (req, res, next) => {
        const user = res.locals.user;
        // step: change credentialsChangedAt
        const updatedAdmin = await admin_model_1.Admin.update({ credentialsChangedAt: new Date(Date.now()) }, { where: { id: user.id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Logged out successfully",
        });
    };
}
exports.AdminService = AdminService;
