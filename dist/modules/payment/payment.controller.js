"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const validation_middleware_1 = require("../../core/middlewares/validation.middleware");
const payment_service_1 = require("./payment.service");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
const paymentService = new payment_service_1.PaymentService();
// Customer payment routes
router.post("/pay-with-stripe", auth_middleware_1.auth, (0, validation_middleware_1.validation)(payment_validation_1.payWithStripeSchema), paymentService.payWithStripe);
router.post("/refund-with-stripe", auth_middleware_1.auth, (0, validation_middleware_1.validation)(payment_validation_1.refundWithStripeSchema), paymentService.refundWithStripe);
router.post("/web-hook-with-stripe", paymentService.webHookWithStripe);
exports.default = router;
