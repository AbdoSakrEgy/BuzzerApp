"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundWithStripeSchema = exports.payWithStripeSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.payWithStripeSchema = zod_1.default.object({
    userCoupons: zod_1.default.array(zod_1.default.string()).optional(),
});
exports.refundWithStripeSchema = zod_1.default.object({
    paymentId: zod_1.default.number().positive(),
});
