"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartSchema = exports.deleteCartSchema = exports.updateCartSchema = exports.getCartSchema = exports.addCartSchema = void 0;
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
// addCartSchema
exports.addCartSchema = zod_1.default.object({
    product_id: integerFromString,
    quantity: integerFromString
        .refine((val) => val >= 1, {
        message: "Quantity must be at least 1",
    })
        .default(1),
});
// getCartSchema
exports.getCartSchema = zod_1.default.object({});
// updateCartSchema
exports.updateCartSchema = zod_1.default.object({
    cart_item_id: integerFromString,
    quantity: integerFromString.refine((val) => val >= 1, {
        message: "Quantity must be at least 1",
    }),
});
// deleteCartSchema
exports.deleteCartSchema = zod_1.default.object({
    cart_item_id: zod_1.default.string(),
});
// clearCartSchema
exports.clearCartSchema = zod_1.default.object({});
