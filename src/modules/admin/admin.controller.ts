import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.type";
import {
  deleteAccountSchema,
  updateBasicInfoSchema,
} from "./admin.validation";
import { AdminService } from "./admin.service";

const router = Router();
const adminService = new AdminService();

router.delete("/delete-account",auth,validation(deleteAccountSchema),adminService.deleteAccount)
router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),adminService.uploadProfileImage);
router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),adminService.updateBasicInfo);

export default router;
