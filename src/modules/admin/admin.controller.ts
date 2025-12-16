import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.type";
import {
  deleteAccountSchema,
  deleteMultiFilesSchema,
  loginSchema,
  registerSchema,
  updateBasicInfoSchema,
  registerCheckOtpSchema,
  loginCheckOtpSchema,
} from "./admin.validation";
import { AdminService } from "./admin.service";

const router = Router();
const adminService = new AdminService();

router.post("/register",validation(registerSchema), adminService.register);
router.post("/login",validation(loginSchema), adminService.login);
router.post("/register-check-otp",validation(registerCheckOtpSchema), adminService.registerCheckOtp);
router.post("/login-check-otp",validation(loginCheckOtpSchema), adminService.loginCheckOtp);
router.post("/refresh-token",adminService.refreshToken);
router.post("/delete-account",auth,validation(deleteAccountSchema),adminService.deleteAccount)
router.get("/profile", auth, adminService.profile);

// router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),adminService.uploadProfileImage);
// router.get("/get-file/*path", adminService.getFile);
// router.delete("/delete-file/*path", adminService.deleteFile);
// router.delete("/delete-multi-files",validation(deleteMultiFilesSchema),adminService.deleteMultiFiles);
// router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),adminService.updateBasicInfo);

export default router;
