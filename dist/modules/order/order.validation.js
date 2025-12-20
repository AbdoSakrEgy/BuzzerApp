"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderSchema = exports.updateOrderSchema = exports.getOrderSchema = exports.addOrderSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const global_types_1 = require("../../types/global.types");
// Helper to transform string numbers to integers
const integerFromString = zod_1.default
    .union([zod_1.default.number(), zod_1.default.string()])
    .transform((val) => {
    if (typeof val === "number")
        return val;
    return parseInt(val, 10);
})
    .refine((val) => !isNaN(val), { message: "Must be a valid number" });
// addOrderSchema
exports.addOrderSchema = zod_1.default.object({
    address_id: integerFromString.optional(),
    notes: zod_1.default.string().max(500).optional(),
    couponCode: zod_1.default.string().max(50).optional(),
});
// getOrderSchema
exports.getOrderSchema = zod_1.default.object({
    order_id: zod_1.default.string(),
});
// updateOrderSchema
exports.updateOrderSchema = zod_1.default.object({
    order_id: integerFromString,
    status: zod_1.default.enum([
        global_types_1.OrderStatusEnum.PENDING,
        global_types_1.OrderStatusEnum.PAID,
        global_types_1.OrderStatusEnum.CANCELLED,
        global_types_1.OrderStatusEnum.REFUNDED,
    ]),
});
// deleteOrderSchema
exports.deleteOrderSchema = zod_1.default.object({
    order_id: zod_1.default.string(),
});
