"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBasicInfoSchema = exports.uploadProfileImageSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const global_types_1 = require("../../types/global.types");
exports.uploadProfileImageSchema = zod_1.default.object({
    profileImage: zod_1.default.object(),
});
exports.updateBasicInfoSchema = zod_1.default.object({
    fullName: zod_1.default.string().min(3).max(50).optional(),
    age: zod_1.default.number().min(18).max(200).optional(),
    gender: zod_1.default.literal([global_types_1.GenderEnum.MALE, global_types_1.GenderEnum.FEMALE]).optional(),
    email: zod_1.default.email().optional(),
});
