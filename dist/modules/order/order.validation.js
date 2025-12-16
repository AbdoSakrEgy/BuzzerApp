"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderSchema = exports.updateOrderSchema = exports.getOrdersSchema = exports.getOrderSchema = exports.addOrderSchema = void 0;
const zod_1 = __importDefault(require("zod"));
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
});
// getOrderSchema
exports.getOrderSchema = zod_1.default.object({
    order_id: zod_1.default.string(),
});
// getOrdersSchema
exports.getOrdersSchema = zod_1.default.object({
    status: zod_1.default.enum(["pending", "paid", "cancelled", "refunded"]).optional(),
    page: integerFromString.default(1),
    limit: integerFromString.default(10),
});
// updateOrderSchema
exports.updateOrderSchema = zod_1.default.object({
    order_id: integerFromString,
    status: zod_1.default.enum(["pending", "paid", "cancelled", "refunded"]),
});
// deleteOrderSchema
exports.deleteOrderSchema = zod_1.default.object({
    order_id: zod_1.default.string(),
});
