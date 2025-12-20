import z from "zod";
import { OrderStatusEnum } from "../../types/global.types";

// Helper to transform string numbers to integers
const integerFromString = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (typeof val === "number") return val;
    return parseInt(val, 10);
  })
  .refine((val) => !isNaN(val), { message: "Must be a valid number" });

// addOrderSchema
export const addOrderSchema = z.object({
  address_id: integerFromString.optional(),
  notes: z.string().max(500).optional(),
  couponCode: z.string().max(50).optional(),
});

// getOrderSchema
export const getOrderSchema = z.object({
  order_id: z.string(),
});

// updateOrderSchema
export const updateOrderSchema = z.object({
  order_id: integerFromString,
  status: z.enum([
    OrderStatusEnum.PENDING,
    OrderStatusEnum.PAID,
    OrderStatusEnum.CANCELLED,
    OrderStatusEnum.REFUNDED,
  ]),
});

// deleteOrderSchema
export const deleteOrderSchema = z.object({
  order_id: z.string(),
});
