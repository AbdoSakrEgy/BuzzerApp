"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const admin_controller_1 = __importDefault(require("./modules/admin/admin.controller"));
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
router.use("/admin", admin_controller_1.default);
router.use("/auth", auth_controller_1.default);
exports.default = router;
