import { Router } from "express";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { CartService } from "./cart.service";
import { deleteCartSchema } from "./cart.validation";

const router = Router();
const cartService = new CartService();

router.post("/add-item", auth, cartService.addCart);
router.get("/get-cart", auth, cartService.getCart);
router.patch("/update-item", auth, cartService.updateCart);
router.delete("/delete-item/:cart_item_id",auth,validation(deleteCartSchema),cartService.deleteCart);
router.delete("/clear", auth, cartService.clearCart);

export default router;
