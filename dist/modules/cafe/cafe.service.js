"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CafeService = void 0;
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const response_handler_1 = require("../../core/handlers/response.handler");
const cafe_validation_1 = require("./cafe.validation");
const cafe_model_1 = require("../../DB/models/cafe.model");
class CafeService {
    constructor() { }
    // ============================ uploadProfileImage ============================
    uploadProfileImage = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = cafe_validation_1.uploadProfileImageSchema.safeParse({
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
            dest: `cafe/${user.id}/profileImage`,
            fileFromMulter: req.file,
        });
        // step: update user
        const url = await (0, S3_services_1.createPresignedUrlToGetFileS3)({ Key });
        await cafe_model_1.Cafe.update({ profileImage_public_id: Key }, { where: { id: user.id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Profile image uploaded successfully",
            data: { Key },
        });
    };
    // ============================ updateBasicInfo ============================
    updateBasicInfo = async (req, res, next) => {
        const user = res.locals.user;
        const { fullName, age, gender, email, phone } = req.body;
        // step: check phone validation
        if (phone) {
            const checkCafe = await cafe_model_1.Cafe.findOne({ where: { phone } });
            if (checkCafe && checkCafe.get("id") !== user.id) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Phone already exists");
            }
        }
        // step: check email validation
        if (email) {
            const checkCafe = await cafe_model_1.Cafe.findOne({ where: { email } });
            if (checkCafe && checkCafe.get("id") !== user.id) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Email already exists");
            }
        }
        // step: update basic info
        const updatedCafe = await cafe_model_1.Cafe.update({ fullName, age, gender }, { where: { id: user.id } });
        if (!updatedCafe) {
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Error while update cafe",
                status: 500,
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Cafe updated successfully",
            data: { cafe: updatedCafe },
        });
    };
    // ============================ allCafes ============================
    allCafes = async (req, res, next) => {
        const cafes = await cafe_model_1.Cafe.findAll();
        return (0, response_handler_1.responseHandler)({
            res,
            data: { cafes },
        });
    };
}
exports.CafeService = CafeService;
