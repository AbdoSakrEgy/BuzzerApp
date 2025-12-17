import { Router, raw } from "express";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { PaymentService } from "./payment.service";
import { payWithStripeSchema, refundWithStripeSchema } from "./payment.validation";

const router = Router();
const paymentService = new PaymentService();

// Customer payment routes
router.post("/pay-with-stripe",auth,validation(payWithStripeSchema),paymentService.payWithStripe);
router.post("/refund-with-stripe",auth,validation(refundWithStripeSchema),paymentService.refundWithStripe);
router.post("/web-hook-with-stripe", paymentService.webHookWithStripe);

export default router;
