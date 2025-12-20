import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.types";
import {
  updateBasicInfoSchema,
} from "./cafe.validation";
import { CafeService } from "./cafe.service";

const router = Router();
const cafeService = new CafeService();

router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),cafeService.uploadProfileImage);
router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),cafeService.updateBasicInfo);
router.get("/all-cafes",cafeService.allCafes);

export default router;
