import z from "zod";
import { payWithStripeSchema, refundWithStripeSchema } from "./payment.validation";

export type payWithStripeDTO = z.infer<typeof payWithStripeSchema>;
export type refundWithStripeDTO = z.infer<typeof refundWithStripeSchema>;
