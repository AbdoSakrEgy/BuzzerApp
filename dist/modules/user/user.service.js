"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const multer_type_1 = require("../../types/multer.type");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const user_model_1 = require("./user.model");
const response_handler_1 = require("../../core/handlers/response.handler");
const user_validation_1 = require("./user.validation");
class UserService {
    constructor() { }
    // ============================ userProfile ============================
    userProfile = async (req, res, next) => {
        let user = res.locals.user;
        let userId = req.params?.userId;
        // step: if userId existence
        if (userId) {
            user = await user_model_1.UserModel.findOne({ _id: userId });
        }
        userId = user._id;
        return (0, response_handler_1.responseHandler)({ res, data: { user } });
    };
    // ============================ uploadProfileImage ============================
    uploadProfileImage = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = user_validation_1.uploadProfileImageSchema.safeParse({
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
            dest: `users/${user._id}/profileImage`,
            fileFromMulter: req.file,
        });
        // step: update user
        const updatedUser = await user_model_1.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { profileImage: Key } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Profile image uploaded successfully",
            data: { Key },
        });
    };
    // ============================ uploadProfileVideo ============================
    uploadProfileVideo = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = user_validation_1.uploadProfileVideoSchema.safeParse({
            ...req.body,
            profileVideo: req.file,
        });
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        // step: upload video
        const Key = await (0, S3_services_1.uploadSingleLargeFileS3)({
            dest: `users/${user._id}/profileVideo`,
            fileFromMulter: req.file,
            storeIn: multer_type_1.StoreInEnum.DISK,
        });
        // step: update user
        const updatedUser = await user_model_1.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { profileVideo: Key } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Profile video uploaded successfully",
            data: { Key },
        });
    };
    // ============================ uploadAvatarImage ============================
    uploadAvatarImage = async (req, res, next) => {
        const user = res.locals.user;
        const { fileName, fileType } = req.body;
        // step: upload image
        const { url, Key } = await (0, S3_services_1.createPreSignedUrlToUploadFileS3)({
            dest: `users/${user._id}/avatarImage`,
            fileName,
            ContentType: fileType,
        });
        // step: update user
        const updatedUser = await user_model_1.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { avatarImage: Key } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Use url to upload your image by using it as API with PUT method",
            data: { url, Key },
        });
    };
    // ============================ uploadCoverImages ============================
    uploadCoverImages = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = user_validation_1.uploadCoverImagesSchema.safeParse({
            ...req.body,
            coverImages: req.files,
        });
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        // step: upload images
        const Keys = await (0, S3_services_1.uploadMultiFilesS3)({
            filesFromMulter: req.files,
            dest: `users/${user._id}/coverImages`,
        });
        // step: update user
        const updatedUser = await user_model_1.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { coverImages: Keys } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Cover images uploaded successfully",
            data: { Keys },
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
        const { firstName, lastName, age, gender, phone } = req.body;
        // step: update basic info
        const updatedUser = await user_model_1.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { firstName, lastName, age, gender, phone } }, { new: true });
        if (!updatedUser) {
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Error while update user",
                status: 500,
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "User updated successfully",
            data: { user: updatedUser },
        });
    };
}
exports.UserService = UserService;
