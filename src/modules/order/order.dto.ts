import z from "zod";
import {
  addOrderSchema,
  deleteOrderSchema,
  getOrderSchema,
  updateOrderSchema,
} from "./order.validation";

export type addOrderDTO = z.infer<typeof addOrderSchema>;
export type getOrderDTO = z.infer<typeof getOrderSchema>;
export type updateOrderDTO = z.infer<typeof updateOrderSchema>;
export type deleteOrderDTO = z.infer<typeof deleteOrderSchema>;
