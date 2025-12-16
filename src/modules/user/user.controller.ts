import { Router } from "express";
import { UserService } from "./user.service";
import {
  deleteMultiFilesSchema,
  updateBasicInfoSchema,
  uploadAvatarImageSchema,
} from "./user.validation";
import { multerUpload } from "../../utils/multer/multer.upload";
import { auth } from "../../core/middlewares/auth.middleware";
import { validation } from "../../core/middlewares/validation.middleware";
import { FileType, StoreInEnum } from "../../types/multer.type";

const router = Router();
const userService = new UserService();

router.get("/user-profile", auth, userService.userProfile);
router.get("/user-profile-with-id/:userId", auth, userService.userProfile);
router.patch("/upload-profile-image",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).single("profileImage"),userService.uploadProfileImage);
router.patch("/upload-profile-video",auth,multerUpload({sendedFileType: FileType.video,storeIn: StoreInEnum.DISK,}).single("profileVideo"),userService.uploadProfileVideo);
router.patch("/upload-avatar-image",auth,validation(uploadAvatarImageSchema),userService.uploadAvatarImage);
router.patch("/upload-cover-images",auth,multerUpload({ storeIn: StoreInEnum.MEMORY }).array("coverImages", 3),userService.uploadCoverImages);
router.get("/get-file/*path", userService.getFile);
router.delete("/delete-file/*path", userService.deleteFile);
router.delete("/delete-multi-files",validation(deleteMultiFilesSchema),userService.deleteMultiFiles);
router.patch("/update-basic-info",auth,validation(updateBasicInfoSchema),userService.updateBasicInfo);

export default router;
