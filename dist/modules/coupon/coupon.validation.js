"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCouponSchema = exports.updateCouponSchema = exports.getCouponSchema = exports.addCouponSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// Helper to transform string "true"/"false" to boolean
const booleanFromString = zod_1.default
    .union([zod_1.default.boolean(), zod_1.default.string()])
    .transform((val) => {
    if (typeof val === "boolean")
        return val;
    return val === "true";
});
exports.addCouponSchema = zod_1.default.object({
    code: zod_1.default.string().min(1).max(50),
    discountType: zod_1.default.enum(["percentage", "fixed"]),
    discountValue: zod_1.default.coerce.number().positive(),
    maxDiscount: zod_1.default.coerce.number().positive().optional(),
    minOrderAmount: zod_1.default.coerce.number().nonnegative().optional(),
    expiresAt: zod_1.default.string().datetime().optional(),
    usageLimit: zod_1.default.coerce.number().int().positive().optional(),
    isActive: booleanFromString.default(true),
});
exports.getCouponSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
exports.updateCouponSchema = zod_1.default.object({
    id: zod_1.default.string(),
    code: zod_1.default.string().min(1).max(50).optional(),
    discountType: zod_1.default.enum(["percentage", "fixed"]).optional(),
    discountValue: zod_1.default.coerce.number().positive().optional(),
    maxDiscount: zod_1.default.coerce.number().positive().optional().nullable(),
    minOrderAmount: zod_1.default.coerce.number().nonnegative().optional().nullable(),
    expiresAt: zod_1.default.string().datetime().optional().nullable(),
    usageLimit: zod_1.default.coerce.number().int().positive().optional().nullable(),
    isActive: booleanFromString.optional(),
});
exports.deleteCouponSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
