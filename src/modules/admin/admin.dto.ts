import z from "zod";
import {
  deleteAccountSchema,
  deleteMultiFilesSchema,
  updateBasicInfoSchema,
  uploadProfileImageSchema,
} from "./admin.validation";

export type deleteAccountDTO = z.infer<typeof deleteAccountSchema>;
export type uploadProfileImageDTO = z.infer<typeof uploadProfileImageSchema>;
export type deleteMultiFilesDTO = z.infer<typeof deleteMultiFilesSchema>;
export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
