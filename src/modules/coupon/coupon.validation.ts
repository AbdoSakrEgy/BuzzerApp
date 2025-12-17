import z from "zod";

// Helper to transform string "true"/"false" to boolean
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true";
  });

export const addCouponSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive(),
  maxDiscount: z.coerce.number().positive().optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  isActive: booleanFromString.default(true),
});

export const getCouponSchema = z.object({
  id: z.string(),
});

export const updateCouponSchema = z.object({
  id: z.string(),
  code: z.string().min(1).max(50).optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.coerce.number().positive().optional(),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  minOrderAmount: z.coerce.number().nonnegative().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: booleanFromString.optional(),
});

export const deleteCouponSchema = z.object({
  id: z.string(),
});
