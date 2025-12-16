import { Router } from "express";
import { auth } from "../../core/middlewares/auth.middleware";
import { CartService } from "./cart.service";

const router = Router();
const cartService = new CartService();

router.post("/add-item", auth, cartService.addCart);

export default router;
