"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const restaurant_model_1 = require("./../../DB/models/restaurant.model");
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const response_handler_1 = require("../../core/handlers/response.handler");
const restaurant_validation_1 = require("./restaurant.validation");
class RestaurantService {
    constructor() { }
    // ============================ uploadProfileImage ============================
    uploadProfileImage = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = restaurant_validation_1.uploadProfileImageSchema.safeParse({
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
            dest: `restaurants/${user.id}/profileImage`,
            fileFromMulter: req.file,
        });
        // step: update user
        await restaurant_model_1.Restaurant.update({ profileImage: Key }, { where: { id: user.id } });
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
            const checkRestaurant = await restaurant_model_1.Restaurant.findOne({ where: { email } });
            if (checkRestaurant && checkRestaurant.get("id") !== user.id) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Email already exists");
            }
        }
        // step: update basic info
        const updatedRestaurant = await restaurant_model_1.Restaurant.update({ fullName, age, gender }, { where: { id: user.id } });
        if (!updatedRestaurant) {
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Error while update restaurant",
                status: 500,
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Restaurant updated successfully",
            data: { restaurant: updatedRestaurant },
        });
    };
}
exports.RestaurantService = RestaurantService;
