"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategorySchema = exports.updateCategorySchema = exports.getCategorySchema = exports.addCategorySchema = exports.updateBasicInfoSchema = exports.uploadProfileImageSchema = exports.deleteAccountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const global_types_1 = require("../../types/global.types");
exports.deleteAccountSchema = zod_1.default.object({
    accountId: zod_1.default.string(),
    accountType: zod_1.default.string(),
});
exports.uploadProfileImageSchema = zod_1.default.object({
    profileImage: zod_1.default.object(),
});
exports.updateBasicInfoSchema = zod_1.default
    .object({
    fullName: zod_1.default.string().min(3).max(50).optional(),
    age: zod_1.default.number().min(18).max(200).optional(),
    gender: zod_1.default.literal([global_types_1.GenderEnum.MALE, global_types_1.GenderEnum.FEMALE]).optional(),
    email: zod_1.default.email().optional(),
    phone: zod_1.default.string().optional(),
})
    .superRefine((args, ctx) => {
    if (args.phone) {
        const clean = args.phone.replace(/[\s-]/g, "");
        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        if (!phoneRegex.test(clean)) {
            ctx.addIssue({
                code: "custom",
                path: ["phone"],
                message: "Phone number is incorrect",
            });
        }
    }
    if (args.email) {
        if (args.email == "zzzzz@gmail.com") {
            ctx.addIssue({
                code: "custom",
                path: ["email"],
                message: "zzzzz@gmail.com not valid email to use :), test custom validation",
            });
        }
    }
});
exports.addCategorySchema = zod_1.default.object({
    name: zod_1.default.string().min(3).max(20),
    description: zod_1.default.string().min(3).max(300),
});
exports.getCategorySchema = zod_1.default.object({
    name: zod_1.default.string().min(3).max(20),
});
exports.updateCategorySchema = zod_1.default.object({
    id: zod_1.default.string(),
    name: zod_1.default.string().min(3).max(20).optional(),
    description: zod_1.default.string().min(3).max(300).optional(),
});
exports.deleteCategorySchema = zod_1.default.object({
    id: zod_1.default.string(),
});
