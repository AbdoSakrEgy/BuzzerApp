import { Router } from "express";
const router = Router();
import adminRouter from "./modules/admin/admin.controller";
import authRouter from "./modules/auth/auth.controller";
import customerRouter from "./modules/customer/customer.controller";
import productRouter from "./modules/product/product.controller";

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/customer", customerRouter);
router.use("/product", productRouter);

export default router;
