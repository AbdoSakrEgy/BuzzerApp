"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductSchema = exports.updateProductSchema = exports.getProductSchema = exports.addProductSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.addProductSchema = zod_1.default.object({
    name: zod_1.default.string(),
    description: zod_1.default.string(),
});
exports.getProductSchema = zod_1.default.object({
    name: zod_1.default.string(),
    description: zod_1.default.string(),
});
exports.updateProductSchema = zod_1.default.object({
    name: zod_1.default.string(),
    description: zod_1.default.string(),
});
exports.deleteProductSchema = zod_1.default.object({
    name: zod_1.default.string(),
    description: zod_1.default.string(),
});
