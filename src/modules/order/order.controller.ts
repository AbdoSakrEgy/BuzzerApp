import { Router } from "express";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { OrderService } from "./order.service";
import {
  getOrderSchema,
  deleteOrderSchema,
  addOrderSchema,
  updateOrderSchema,
} from "./order.validation";

const router = Router();
const orderService = new OrderService();

router.post("/add-order", auth,validation(addOrderSchema), orderService.addOrder);
router.get("/get-orders", auth,orderService.getOrders);
router.get("/get-order/:order_id", auth,validation(getOrderSchema),orderService.getOrder);
router.patch("/update-order", auth, validation(updateOrderSchema), orderService.updateOrder);
router.delete("/delete-order/:order_id", auth,validation(deleteOrderSchema),orderService.deleteOrder);


export default router;
