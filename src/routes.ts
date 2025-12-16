import { Router } from "express";
const router = Router();
import adminRouter from "./modules/admin/admin.controller";

router.use("/auth", adminRouter);

export default router;
