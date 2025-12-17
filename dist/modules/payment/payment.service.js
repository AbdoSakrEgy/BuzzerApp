"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const stripe_service_1 = require("../../utils/stripe/stripe.service");
const coupon_model_1 = require("../../DB/models/coupon.model");
const cart_model_1 = require("../../DB/models/cart.model");
const cart_item_model_1 = require("../../DB/models/cart.item.model");
const product_model_1 = require("../../DB/models/product.model");
const payment_model_1 = require("../../DB/models/payment.model");
const global_types_1 = require("../../types/global.types");
class PaymentService {
    constructor() { }
    // ============================ payWithStripe ============================
    payWithStripe = async (req, res, next) => {
        const user = res.locals.user;
        const { userCoupons } = req.body;
        // step: check cart validation
        const userCart = await cart_model_1.Cart.findOne({ where: { customer_id: user.id } });
        if (!userCart) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Cart not found");
        }
        const userCartItems = await cart_item_model_1.CartItem.findAll({
            where: { cart_id: userCart.get("id") },
            include: [{ model: product_model_1.Product, as: "product" }],
        });
        if (userCartItems.length === 0) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Cart is empty");
        }
        // step: check coupons validation
        const coupons = [];
        if (userCoupons && userCoupons.length > 0) {
            for (const uc of userCoupons) {
                const coupon = await coupon_model_1.Coupon.findOne({ where: { code: uc } });
                if (!coupon) {
                    throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Invalid coupon: ${uc}`);
                }
                coupons.push(coupon);
            }
        }
        // step: collect createCheckoutSession data
        const discounts = [];
        for (const coupon of coupons) {
            const discountItem = await (0, stripe_service_1.createCoupon)({
                duration: "once",
                currency: "egp",
                percent_off: coupon.discountValue,
            });
            discounts.push({ coupon: discountItem.id });
        }
        const line_items = [];
        userCartItems.forEach((item) => {
            const product = item.get("product");
            if (product) {
                line_items.push({
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: product.name,
                            description: product.description || "",
                        },
                        unit_amount: Math.round(product.price * 100),
                    },
                    quantity: item.get("quantity"),
                });
            }
        });
        // step: create createCheckoutSession
        const checkoutSession = await (0, stripe_service_1.createCheckoutSession)({
            customer_email: user.email,
            line_items,
            mode: "payment",
            discounts,
            metadata: {
                userId: user.id.toString(),
                cartId: String(userCart.get("id")),
                ...(userCoupons && { coupons: userCoupons.join(",") }),
            },
        });
        // step: store checkoutSession ID for reference
        const totalAmount = line_items.reduce((sum, item) => sum + (item.price_data.unit_amount / 100) * item.quantity, 0);
        await payment_model_1.Payment.create({
            customer_id: user.id,
            checkoutSessionId: checkoutSession.id,
            amount: totalAmount,
            status: global_types_1.PaymentStatusEnum.PENDING,
        });
        return (0, response_handler_1.responseHandler)({ res, data: { checkoutSession } });
    };
    // ============================ webHookWithStripe ============================
    webHookWithStripe = async (req, res, next) => {
        const checkoutSessionId = req.body.data.object.id;
        const paymentIntentId = req.body.data.object.payment_intent;
        const { userId, cartId } = req.body.data.object.metadata;
        // step: find and update payment record
        const payment = await payment_model_1.Payment.findOne({
            where: { checkoutSessionId },
        });
        if (!payment) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Payment not found");
        }
        await payment.update({
            paymentIntentId,
            status: global_types_1.PaymentStatusEnum.COMPLETED,
        });
        // step: create order from cart
        const Order = (await Promise.resolve().then(() => __importStar(require("../../DB/models/order.model")))).Order;
        const OrderItem = (await Promise.resolve().then(() => __importStar(require("../../DB/models/order.item.model"))))
            .OrderItem;
        const order = await Order.create({
            customer_id: parseInt(userId),
            totalAmount: payment.get("amount"),
            status: "paid",
            payment_id: payment.get("id"),
        });
        // step: copy cart items to order items
        const cartItems = await cart_item_model_1.CartItem.findAll({
            where: { cart_id: parseInt(cartId) },
            include: [{ model: product_model_1.Product, as: "product" }],
        });
        for (const cartItem of cartItems) {
            const product = cartItem.get("product");
            await OrderItem.create({
                order_id: order.get("id"),
                product_id: cartItem.get("product_id"),
                quantity: cartItem.get("quantity"),
                price: product?.price || 0,
            });
        }
        // step: clear the cart
        await cart_item_model_1.CartItem.destroy({ where: { cart_id: parseInt(cartId) } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Payment successful, order created",
        });
    };
    // ============================ refundWithStripe ============================
    refundWithStripe = async (req, res, next) => {
        const user = res.locals.user;
        const { paymentId } = req.body;
        // step: find payment record
        const payment = await payment_model_1.Payment.findOne({
            where: { id: paymentId, customer_id: user.id },
        });
        if (!payment) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Payment not found or you are not authorized");
        }
        // step: check if payment is already refunded
        if (payment.get("status") === global_types_1.PaymentStatusEnum.REFUNDED) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Payment has already been refunded");
        }
        // step: check if payment is completed
        if (payment.get("status") !== global_types_1.PaymentStatusEnum.COMPLETED) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Only completed payments can be refunded");
        }
        // step: check if payment has paymentIntentId
        const paymentIntentId = payment.get("paymentIntentId");
        if (!paymentIntentId) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Payment intent not found");
        }
        // step: create refund in Stripe
        const refund = await (0, stripe_service_1.createRefund)(paymentIntentId);
        // step: update payment record
        await payment.update({
            refundId: refund.id,
            refundedAt: new Date(),
            status: global_types_1.PaymentStatusEnum.REFUNDED,
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Payment refunded successfully",
            data: { refund },
        });
    };
}
exports.PaymentService = PaymentService;
