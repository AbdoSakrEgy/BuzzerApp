import z from "zod";
import {
  addOrderSchema,
  deleteOrderSchema,
  getOrderSchema,
  getOrdersSchema,
  updateOrderSchema,
} from "./order.validation";

export type addOrderDTO = z.infer<typeof addOrderSchema>;
export type getOrderDTO = z.infer<typeof getOrderSchema>;
export type getOrdersDTO = z.infer<typeof getOrdersSchema>;
export type updateOrderDTO = z.infer<typeof updateOrderSchema>;
export type deleteOrderDTO = z.infer<typeof deleteOrderSchema>;
