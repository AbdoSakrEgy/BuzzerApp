import { Router } from "express";
const router = Router();
import adminRouter from "./modules/admin/admin.controller";

router.use("/admin", adminRouter);

export default router;
