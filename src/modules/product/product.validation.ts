import z from "zod";

export const addProductSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const getProductSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const updateProductSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const deleteProductSchema = z.object({
  name: z.string(),
  description: z.string(),
});
