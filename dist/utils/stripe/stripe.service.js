"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = createCheckoutSession;
exports.createCoupon = createCoupon;
exports.createRefund = createRefund;
exports.retrievePaymentIntent = retrievePaymentIntent;
const stripe_1 = __importDefault(require("stripe"));
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
let stripe = null;
function getStripeInstance() {
    if (!stripe) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        stripe = new stripe_1.default(secretKey);
    }
    return stripe;
}
// ============================ createCheckoutSession ============================
async function createCheckoutSession({ success_url = process.env.SUCCESS_URL, cancel_url = process.env.CANCEL_URL, mode = "payment", discounts = [], metadata = {}, line_items, customer_email, }) {
    const stripeInstance = getStripeInstance();
    const session = await stripeInstance.checkout.sessions.create({
        success_url,
        cancel_url,
        mode,
        discounts,
        metadata,
        ...(customer_email && { customer_email }),
        ...(line_items && { line_items }),
    });
    return session;
}
// ============================ createCoupon ============================
async function createCoupon(data) {
    const stripeInstance = getStripeInstance();
    const coupon = await stripeInstance.coupons.create(data);
    return coupon;
}
// ============================ createRefund ============================
async function createRefund(id) {
    const stripeInstance = getStripeInstance();
    const paymentIntent = await retrievePaymentIntent(id);
    if (!paymentIntent)
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Invalid paymentIntent id");
    const refund = await stripeInstance.refunds.create({
        payment_intent: id,
    });
    return refund;
}
// ============================ retrievePaymentIntent ============================
async function retrievePaymentIntent(id) {
    const stripeInstance = getStripeInstance();
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(id);
    return paymentIntent;
}
