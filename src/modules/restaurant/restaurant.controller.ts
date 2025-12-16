import { Router } from "express";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { StoreInEnum } from "../../types/multer.types";
import {
  updateBasicInfoSchema,
} from "./restaurant.validation";
import { RestaurantService } from "./restaurant.service";

const router = Router();
const restaurantService = new RestaurantService();

router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),restaurantService.uploadProfileImage);
router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),restaurantService.updateBasicInfo);

export default router;
