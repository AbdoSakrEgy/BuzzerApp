import z from "zod";
import {
  addCartSchema,
  deleteCartSchema,
  getCartSchema,
  updateCartSchema,
  clearCartSchema,
} from "./cart.validation";

export type addCartDTO = z.infer<typeof addCartSchema>;
export type getCartDTO = z.infer<typeof getCartSchema>;
export type updateCartDTO = z.infer<typeof updateCartSchema>;
export type deleteCartDTO = z.infer<typeof deleteCartSchema>;
export type clearCartDTO = z.infer<typeof clearCartSchema>;
