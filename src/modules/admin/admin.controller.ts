import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.types";
import {
  addCategorySchema,
  deleteAccountSchema,
  deleteCategorySchema,
  getCategorySchema,
  updateBasicInfoSchema,
  updateCategorySchema,
} from "./admin.validation";
import { AdminService } from "./admin.service";

const router = Router();
const adminService = new AdminService();

router.delete("/delete-account",auth,validation(deleteAccountSchema),adminService.deleteAccount)
router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),adminService.uploadProfileImage);
router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),adminService.updateBasicInfo);
router.post("/add-category",auth,validation(addCategorySchema),adminService.addCategory)
router.get("/get-category",auth,validation(getCategorySchema),adminService.getCategory)
router.patch("/update-category",auth,validation(updateCategorySchema),adminService.updateCategory)
router.delete("/delete-category",auth,validation(deleteCategorySchema),adminService.deleteCategory)

export default router;
