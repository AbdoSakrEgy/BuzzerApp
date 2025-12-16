import z from "zod";

// Helper to transform string "true"/"false" to boolean
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true";
  });

export const addAddressSchema = z.object({
  label: z.string().max(50).optional(),
  city: z.string().min(1).max(100),
  area: z.string().max(100).optional(),
  street: z.string().max(255).optional(),
  building: z.string().max(100).optional(),
  floor: z.string().max(50).optional(),
  apartment: z.string().max(50).optional(),
  isDefault: booleanFromString.default(false),
});

export const getAddressSchema = z.object({
  id: z.string(),
});

export const updateAddressSchema = z.object({
  id: z.string(),
  label: z.string().max(50).optional().nullable(),
  city: z.string().min(1).max(100).optional(),
  area: z.string().max(100).optional().nullable(),
  street: z.string().max(255).optional().nullable(),
  building: z.string().max(100).optional().nullable(),
  floor: z.string().max(50).optional().nullable(),
  apartment: z.string().max(50).optional().nullable(),
  isDefault: booleanFromString.optional(),
});

export const deleteAddressSchema = z.object({
  id: z.string(),
});

export const getAllAddressesSchema = z.object({});
