"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductSchema = exports.updateProductSchema = exports.getProductSchema = exports.addProductSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// Helper to transform string "true"/"false" to boolean
const booleanFromString = zod_1.default
    .union([zod_1.default.boolean(), zod_1.default.string()])
    .transform((val) => {
    if (typeof val === "boolean")
        return val;
    return val === "true";
});
exports.addProductSchema = zod_1.default
    .object({
    category_id: zod_1.default.string(),
    cafe_id: zod_1.default.string().optional(),
    restaurant_id: zod_1.default.string().optional(),
    name: zod_1.default.string().min(1).max(255),
    description: zod_1.default.string().optional(),
    price: zod_1.default.coerce.number().positive(),
    availableQuantity: zod_1.default.coerce.number().int().nonnegative().default(0),
    isAvailable: booleanFromString.default(true),
})
    .refine((data) => data.cafe_id || data.restaurant_id, {
    message: "Either cafe_id or restaurant_id must be provided",
});
exports.getProductSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
exports.updateProductSchema = zod_1.default.object({
    id: zod_1.default.string(),
    category_id: zod_1.default.string().optional(),
    cafe_id: zod_1.default.string().optional().nullable(),
    restaurant_id: zod_1.default.string().optional().nullable(),
    name: zod_1.default.string().min(1).max(255).optional(),
    description: zod_1.default.string().optional().nullable(),
    price: zod_1.default.coerce.number().positive().optional(),
    availableQuantity: zod_1.default.coerce.number().int().nonnegative().optional(),
    isAvailable: booleanFromString.optional(),
});
exports.deleteProductSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
