"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAddressesSchema = exports.deleteAddressSchema = exports.updateAddressSchema = exports.getAddressSchema = exports.addAddressSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// Helper to transform string "true"/"false" to boolean
const booleanFromString = zod_1.default
    .union([zod_1.default.boolean(), zod_1.default.string()])
    .transform((val) => {
    if (typeof val === "boolean")
        return val;
    return val === "true";
});
exports.addAddressSchema = zod_1.default.object({
    label: zod_1.default.string().max(50).optional(),
    city: zod_1.default.string().min(1).max(100),
    area: zod_1.default.string().max(100).optional(),
    street: zod_1.default.string().max(255).optional(),
    building: zod_1.default.string().max(100).optional(),
    floor: zod_1.default.string().max(50).optional(),
    apartment: zod_1.default.string().max(50).optional(),
    isDefault: booleanFromString.default(false),
});
exports.getAddressSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
exports.updateAddressSchema = zod_1.default.object({
    id: zod_1.default.string(),
    label: zod_1.default.string().max(50).optional().nullable(),
    city: zod_1.default.string().min(1).max(100).optional(),
    area: zod_1.default.string().max(100).optional().nullable(),
    street: zod_1.default.string().max(255).optional().nullable(),
    building: zod_1.default.string().max(100).optional().nullable(),
    floor: zod_1.default.string().max(50).optional().nullable(),
    apartment: zod_1.default.string().max(50).optional().nullable(),
    isDefault: booleanFromString.optional(),
});
exports.deleteAddressSchema = zod_1.default.object({
    id: zod_1.default.string(),
});
exports.getAllAddressesSchema = zod_1.default.object({});
