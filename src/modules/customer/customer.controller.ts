import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.types";
import {
  updateBasicInfoSchema,
} from "./customer.validation";
import { CustomerService } from "./customer.service";

const router = Router();
const customerService = new CustomerService();

router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),customerService.uploadProfileImage);
router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),customerService.updateBasicInfo);

export default router;
