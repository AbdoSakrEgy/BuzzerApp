"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartSchema = exports.updateCartSchema = exports.getCartSchema = exports.addCartSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.addCartSchema = zod_1.default.object({});
exports.getCartSchema = zod_1.default.object({});
exports.updateCartSchema = zod_1.default.object({});
exports.deleteCartSchema = zod_1.default.object({});
