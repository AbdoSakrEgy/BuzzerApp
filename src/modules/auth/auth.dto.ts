import z from "zod";
import {
  deleteAccountSchema,
  deleteMultiFilesSchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  updateBasicInfoSchema,
  uploadProfileImageSchema,
} from "./auth.validation";

export type registerDTO = z.infer<typeof registerSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
export type deleteAccountDTO = z.infer<typeof deleteAccountSchema>;
export type uploadProfileImageDTO = z.infer<typeof uploadProfileImageSchema>;
export type deleteMultiFilesDTO = z.infer<typeof deleteMultiFilesSchema>;
export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
export type logoutDTO = z.infer<typeof logoutSchema>;
