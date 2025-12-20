"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const address_model_1 = require("../../DB/models/address.model");
const address_validation_1 = require("./address.validation");
class AddressService {
    constructor() { }
    // ============================ addAddress ============================
    addAddress = async (req, res, next) => {
        const { userId, userType } = res.locals.payload;
        // step: validate request body
        const parsed = address_validation_1.addAddressSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { label, city, area, street, building, floor, apartment, isDefault, } = parsed.data;
        // step: if isDefault is true, set all other addresses to not default
        if (isDefault) {
            await address_model_1.Address.update({ isDefault: false }, { where: { user_id: userId, user_type: userType } });
        }
        // step: create address
        const address = await address_model_1.Address.create({
            user_id: userId,
            user_type: userType,
            label,
            city,
            area,
            street,
            building,
            floor,
            apartment,
            isDefault,
        });
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.CREATED,
            message: "Address created successfully",
            data: { address },
        });
    };
    // ============================ getAddress ============================
    getAddress = async (req, res, next) => {
        const { userId, userType } = res.locals.payload;
        const { id } = req.params;
        // step: find address (check ownership by user_id and user_type)
        const address = await address_model_1.Address.findOne({
            where: { id, user_id: userId, user_type: userType },
        });
        if (!address) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Address not found");
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Address retrieved successfully",
            data: { address },
        });
    };
    // ============================ getAllAddresses ============================
    getAllAddresses = async (req, res, next) => {
        const addresses = await address_model_1.Address.findAll();
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Addresses retrieved successfully",
            data: { addresses },
        });
    };
    // ============================ updateAddress ============================
    updateAddress = async (req, res, next) => {
        const { userId, userType } = res.locals.payload;
        // step: validate request body
        const parsed = address_validation_1.updateAddressSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { id, label, city, area, street, building, floor, apartment, isDefault, } = parsed.data;
        // step: check if address exists and belongs to the user
        const address = await address_model_1.Address.findOne({
            where: { id, user_id: userId, user_type: userType },
        });
        if (!address) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Address not found");
        }
        // step: if isDefault is true, set all other addresses to not default
        if (isDefault) {
            await address_model_1.Address.update({ isDefault: false }, { where: { user_id: userId, user_type: userType } });
        }
        // step: update address
        await address_model_1.Address.update({
            label,
            city,
            area,
            street,
            building,
            floor,
            apartment,
            isDefault,
        }, { where: { id } });
        // step: get updated address
        const updatedAddress = await address_model_1.Address.findByPk(id);
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Address updated successfully",
            data: { address: updatedAddress },
        });
    };
    // ============================ deleteAddress ============================
    deleteAddress = async (req, res, next) => {
        const { userId, userType } = res.locals.payload;
        const { id } = req.params;
        // step: check if address exists and belongs to the user
        const address = await address_model_1.Address.findOne({
            where: { id, user_id: userId, user_type: userType },
        });
        if (!address) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Address not found");
        }
        // step: delete address
        await address_model_1.Address.destroy({ where: { id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Address deleted successfully",
            data: { deletedAddressId: id },
        });
    };
    // ============================ setDefaultAddress ============================
    setDefaultAddress = async (req, res, next) => {
        const { userId, userType } = res.locals.payload;
        const { id } = req.params;
        // step: check if address exists and belongs to the user
        const address = await address_model_1.Address.findOne({
            where: { id, user_id: userId, user_type: userType },
        });
        if (!address) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Address not found");
        }
        // step: set all addresses to not default
        await address_model_1.Address.update({ isDefault: false }, { where: { user_id: userId, user_type: userType } });
        // step: set this address as default
        await address_model_1.Address.update({ isDefault: true }, { where: { id } });
        // step: get updated address
        const updatedAddress = await address_model_1.Address.findByPk(id);
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Default address set successfully",
            data: { address: updatedAddress },
        });
    };
}
exports.AddressService = AddressService;
