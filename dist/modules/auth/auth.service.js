"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const response_handler_1 = require("../../core/handlers/response.handler");
const jwt_1 = require("../../utils/jwt");
const createOtp_1 = require("../../utils/createOtp");
const admin_model_1 = require("../../DB/models/admin.model");
const decodeToken_1 = require("../../utils/decodeToken");
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const customer_model_1 = require("../../DB/models/customer.model");
const cafe_model_1 = require("../../DB/models/cafe.model");
const restaurant_model_1 = require("../../DB/models/restaurant.model");
const global_types_1 = require("../../types/global.types");
class AdminService {
    constructor() { }
    // ============================ register ============================
    register = async (req, res, next) => {
        const { type, fullName, email, phone, password } = req.body;
        let UserModel;
        if (type == global_types_1.RegisterEnum.ADMIN) {
            UserModel = admin_model_1.Admin;
        }
        else if (type == global_types_1.RegisterEnum.CUSTOMER) {
            UserModel = customer_model_1.Customer;
        }
        else if (type == global_types_1.RegisterEnum.CAFE) {
            UserModel = cafe_model_1.Cafe;
        }
        else if (type == global_types_1.RegisterEnum.RESTAURANT) {
            UserModel = restaurant_model_1.Restaurant;
        }
        // step: check if email already exists
        const checkUserWithEmail = await UserModel.findOne({ where: { email } });
        if (checkUserWithEmail) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "User with this email already exists");
        }
        // step: check if phone already exists
        const checkUserWithPhone = await UserModel.findOne({ where: { phone } });
        if (checkUserWithPhone) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "User with this phone already exists");
        }
        // step: create user
        const user = await UserModel.create({
            fullName,
            email,
            phone,
            password,
        });
        if (!user) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "User did not created");
        }
        // step: create token
        const accessToken = (0, jwt_1.createJwt)({ userId: user.get("id"), userType: type }, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        const refreshToken = (0, jwt_1.createJwt)({ userId: user.get("id"), userType: type }, process.env.REFRESH_SEGNATURE, {
            expiresIn: "7d",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.CREATED,
            message: "User created successfully",
            data: { accessToken, refreshToken },
        });
    };
    // ============================ login ============================
    login = async (req, res, next) => {
        const { type, phone } = req.body;
        let UserModel;
        if (type == global_types_1.RegisterEnum.ADMIN) {
            UserModel = admin_model_1.Admin;
        }
        else if (type == global_types_1.RegisterEnum.CUSTOMER) {
            UserModel = customer_model_1.Customer;
        }
        else if (type == global_types_1.RegisterEnum.CAFE) {
            UserModel = cafe_model_1.Cafe;
        }
        else if (type == global_types_1.RegisterEnum.RESTAURANT) {
            UserModel = restaurant_model_1.Restaurant;
        }
        // step: check user
        const user = await UserModel.findOne({ where: { phone } });
        if (!user) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        // step: create token
        const accessToken = (0, jwt_1.createJwt)({ userId: user.get("id"), userType: type }, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        const refreshToken = (0, jwt_1.createJwt)({ userId: user.get("id"), userType: type }, process.env.REFRESH_SEGNATURE, {
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
        const accessToken = (0, jwt_1.createJwt)(newPayload, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid,
        });
        return (0, response_handler_1.responseHandler)({ res, data: { accessToken } });
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
    // ============================ logout ============================
    logout = async (req, res, next) => {
        const { type } = req.body;
        let UserModel;
        if (type == global_types_1.RegisterEnum.ADMIN) {
            UserModel = admin_model_1.Admin;
        }
        else if (type == global_types_1.RegisterEnum.CUSTOMER) {
            UserModel = customer_model_1.Customer;
        }
        else if (type == global_types_1.RegisterEnum.CAFE) {
            UserModel = cafe_model_1.Cafe;
        }
        else if (type == global_types_1.RegisterEnum.RESTAURANT) {
            UserModel = restaurant_model_1.Restaurant;
        }
        const user = res.locals.user;
        // step: change credentialsChangedAt
        const updatedUser = await UserModel.update({ credentialsChangedAt: new Date(Date.now()) }, { where: { id: user.id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Logged out successfully",
        });
    };
}
exports.AdminService = AdminService;
