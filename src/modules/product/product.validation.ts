import z from "zod";

// Helper to transform string "true"/"false" to boolean
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true";
  });

export const addProductSchema = z
  .object({
    category_id: z.string(),
    cafe_id: z.string().optional(),
    restaurant_id: z.string().optional(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.coerce.number().positive(),
    availableQuantity: z.coerce.number().int().nonnegative().default(0),
    isAvailable: booleanFromString.default(true),
  })
  .refine((data) => data.cafe_id || data.restaurant_id, {
    message: "Either cafe_id or restaurant_id must be provided",
  });

export const getProductSchema = z.object({
  id: z.string(),
});

export const updateProductSchema = z.object({
  id: z.string(),
  category_id: z.string().optional(),
  cafe_id: z.string().optional().nullable(),
  restaurant_id: z.string().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive().optional(),
  availableQuantity: z.coerce.number().int().nonnegative().optional(),
  isAvailable: booleanFromString.optional(),
});

export const deleteProductSchema = z.object({
  id: z.string(),
});
