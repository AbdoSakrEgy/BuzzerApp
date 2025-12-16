import z from "zod";
import {
  addProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./product.validation";

export type addProductDTO = z.infer<typeof addProductSchema>;
export type getProductDTO = z.infer<typeof getProductSchema>;
export type updateProductDTO = z.infer<typeof updateProductSchema>;
export type deleteProductDTO = z.infer<typeof deleteProductSchema>;
