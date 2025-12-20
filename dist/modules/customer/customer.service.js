"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const response_handler_1 = require("../../core/handlers/response.handler");
const customer_validation_1 = require("./customer.validation");
const customer_model_1 = require("../../DB/models/customer.model");
class CustomerService {
    constructor() { }
    // ============================ uploadProfileImage ============================
    uploadProfileImage = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate multipart/form-data req
        const parsed = customer_validation_1.uploadProfileImageSchema.safeParse({
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
            dest: `customer/${user.id}/profileImage`,
            fileFromMulter: req.file,
        });
        // step: update user
        const url = await (0, S3_services_1.createPresignedUrlToGetFileS3)({ Key });
        await customer_model_1.Customer.update({ profileImage_public_id: Key }, { where: { id: user.id } });
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
            const checkCustomer = await customer_model_1.Customer.findOne({ where: { email } });
            if (checkCustomer && checkCustomer.get("id") !== user.id) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Email already exists");
            }
        }
        // step: update basic info
        const updatedCustomer = await customer_model_1.Customer.update({ fullName, age, gender }, { where: { id: user.id } });
        if (!updatedCustomer) {
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Error while update customer",
                status: 500,
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Customer updated successfully",
            data: { Customer: updatedCustomer },
        });
    };
}
exports.CustomerService = CustomerService;
