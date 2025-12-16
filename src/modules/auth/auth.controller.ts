import { Router } from "express";
import { validation } from "../../core/middlewares/validation.middleware";
import {
  loginSchema,
  registerSchema,
  registerCheckOtpSchema,
  loginCheckOtpSchema,
} from "./auth.validation";
import { AdminService } from "./auth.service";
import { auth } from "../../core/middlewares/auth.middleware";

const router = Router();
const adminService = new AdminService();

router.post("/register",validation(registerSchema), adminService.register);
router.post("/login",validation(loginSchema), adminService.login);
router.post("/register-check-otp",validation(registerCheckOtpSchema), adminService.registerCheckOtp);
router.post("/login-check-otp",validation(loginCheckOtpSchema), adminService.loginCheckOtp);
router.post("/refresh-token",adminService.refreshToken);
router.get("/profile",auth, adminService.profile);
router.post("/logout",auth,adminService.logout);

export default router;
