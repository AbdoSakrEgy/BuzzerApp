import z from "zod";

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
});

// getOrderSchema
export const getOrderSchema = z.object({
  order_id: z.string(),
});

// getOrdersSchema
export const getOrdersSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "refunded"]).optional(),
  page: integerFromString.default(1),
  limit: integerFromString.default(10),
});

// updateOrderSchema
export const updateOrderSchema = z.object({
  order_id: integerFromString,
  status: z.enum(["pending", "paid", "cancelled", "refunded"]),
});

// deleteOrderSchema
export const deleteOrderSchema = z.object({
  order_id: z.string(),
});
