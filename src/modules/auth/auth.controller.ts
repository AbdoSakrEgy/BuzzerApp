import { Router } from "express";
import { validation } from "../../core/middlewares/validation.middleware";
import {
  loginSchema,
  registerSchema,
  deleteMultiFilesSchema,
} from "./auth.validation";
import { AdminService } from "./auth.service";
import { auth } from "../../core/middlewares/auth.middleware";

const router = Router();
const adminService = new AdminService();

router.post("/register",validation(registerSchema), adminService.register);
router.post("/login",validation(loginSchema), adminService.login);
router.post("/refresh-token",adminService.refreshToken);
router.get("/profile",auth, adminService.profile);
router.get("/get-file/*path", adminService.getFile);
router.delete("/delete-file/*path", adminService.deleteFile);
router.delete("/delete-multi-files",validation(deleteMultiFilesSchema),adminService.deleteMultiFiles);
router.post("/logout",auth,adminService.logout);

export default router;
