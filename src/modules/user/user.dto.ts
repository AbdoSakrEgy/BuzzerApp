import z from "zod";
import {
  deleteMultiFilesSchema,
  createPresignedUrlToGetFileSchema,
  updateBasicInfoSchema,
  uploadAvatarImageSchema,
} from "./user.validation";

export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
export type uploadAvatarImageDTO = z.infer<typeof uploadAvatarImageSchema>;
export type createPresignedUrlToGetFileDTO = z.infer<typeof createPresignedUrlToGetFileSchema>;
export type deleteMultiFilesDTO = z.infer<typeof deleteMultiFilesSchema>;
