import z from "zod";

// Helper to transform string numbers to integers
const integerFromString = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (typeof val === "number") return val;
    return parseInt(val, 10);
  })
  .refine((val) => !isNaN(val), { message: "Must be a valid number" });

// addCartSchema
export const addCartSchema = z.object({
  product_id: integerFromString,
  quantity: integerFromString
    .refine((val) => val >= 1, {
      message: "Quantity must be at least 1",
    })
    .default(1),
});

// getCartSchema
export const getCartSchema = z.object({});

// updateCartSchema
export const updateCartSchema = z.object({
  cart_item_id: integerFromString,
  quantity: integerFromString.refine((val) => val >= 1, {
    message: "Quantity must be at least 1",
  }),
});

// deleteCartSchema
export const deleteCartSchema = z.object({
  cart_item_id: z.string(),
});

// clearCartSchema
export const clearCartSchema = z.object({});
