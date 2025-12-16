"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const cart_service_1 = require("./cart.service");
const router = (0, express_1.Router)();
const cartService = new cart_service_1.CartService();
router.post("/add-item", auth_middleware_1.auth, cartService.addCart);
exports.default = router;
