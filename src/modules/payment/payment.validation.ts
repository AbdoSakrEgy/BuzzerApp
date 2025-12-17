import z from "zod";

export const payWithStripeSchema = z.object({
  userCoupons: z.array(z.string()).optional(),
});

export const refundWithStripeSchema = z.object({
  paymentId: z.number().positive(),
});
