import { Router } from "express";
const router = Router();
import adminRouter from "./modules/admin/admin.controller";
import authRouter from "./modules/auth/auth.controller";

router.use("/admin", adminRouter);
router.use("/auth", authRouter);

export default router;
