"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const coupon_model_1 = require("../../DB/models/coupon.model");
const order_coupon_model_1 = require("../../DB/models/order.coupon.model");
class CouponService {
    constructor() { }
    // ============================ addCoupon ============================
    addCoupon = async (req, res, next) => {
        const { code, discountType, discountValue, maxDiscount, minOrderAmount, expiresAt, usageLimit, isActive, } = req.body;
        // step: check if coupon code already exists
        const existingCoupon = await coupon_model_1.Coupon.findOne({ where: { code } });
        if (existingCoupon) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.CONFLICT, "Coupon code already exists");
        }
        // step: create coupon
        const coupon = await coupon_model_1.Coupon.create({
            code,
            discountType,
            discountValue,
            maxDiscount,
            minOrderAmount,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            usageLimit,
            isActive,
        });
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.CREATED,
            message: "Coupon created successfully",
            data: { coupon },
        });
    };
    // ============================ getCoupon ============================
    getCoupon = async (req, res, next) => {
        const { id } = req.params;
        // step: find coupon
        const coupon = await coupon_model_1.Coupon.findByPk(id);
        if (!coupon) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Coupon not found");
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Coupon retrieved successfully",
            data: { coupon },
        });
    };
    // ============================ updateCoupon ============================
    updateCoupon = async (req, res, next) => {
        const { id, code, discountType, discountValue, maxDiscount, minOrderAmount, expiresAt, usageLimit, isActive, } = req.body;
        // step: check if coupon exists
        const coupon = await coupon_model_1.Coupon.findByPk(id);
        if (!coupon) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Coupon not found");
        }
        // step: if code is being updated, check if new code already exists
        if (code && code !== coupon.get("code")) {
            const existingCoupon = await coupon_model_1.Coupon.findOne({ where: { code } });
            if (existingCoupon) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.CONFLICT, "Coupon code already exists");
            }
        }
        // step: update coupon
        await coupon_model_1.Coupon.update({
            code,
            discountType,
            discountValue,
            maxDiscount,
            minOrderAmount,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            usageLimit,
            isActive,
        }, { where: { id } });
        // step: get updated coupon
        const updatedCoupon = await coupon_model_1.Coupon.findByPk(id);
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Coupon updated successfully",
            data: { coupon: updatedCoupon },
        });
    };
    // ============================ deleteCoupon ============================
    deleteCoupon = async (req, res, next) => {
        const { id } = req.params;
        // step: check if coupon exists
        const coupon = await coupon_model_1.Coupon.findByPk(id);
        if (!coupon) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Coupon not found");
        }
        // step: check if coupon is being used in any orders
        const orderCouponCount = await order_coupon_model_1.OrderCoupon.count({
            where: { coupon_id: id },
        });
        if (orderCouponCount > 0) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.CONFLICT, "Cannot delete coupon that has been used in orders");
        }
        // step: delete coupon
        await coupon_model_1.Coupon.destroy({ where: { id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Coupon deleted successfully",
            data: { deletedCouponId: id },
        });
    };
}
exports.CouponService = CouponService;
