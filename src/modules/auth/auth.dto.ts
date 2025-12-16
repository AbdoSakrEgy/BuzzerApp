import z from "zod";
import {
  deleteAccountSchema,
  deleteMultiFilesSchema,
  loginCheckOtpSchema,
  loginSchema,
  logoutSchema,
  registerCheckOtpSchema,
  registerSchema,
  updateBasicInfoSchema,
  uploadProfileImageSchema,
} from "./auth.validation";

export type registerDTO = z.infer<typeof registerSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
export type registerCheckOtpDTO = z.infer<typeof registerCheckOtpSchema>;
export type logincheckOtpDTO = z.infer<typeof loginCheckOtpSchema>;
export type deleteAccountDTO = z.infer<typeof deleteAccountSchema>;
export type uploadProfileImageDTO = z.infer<typeof uploadProfileImageSchema>;
export type deleteMultiFilesDTO = z.infer<typeof deleteMultiFilesSchema>;
export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
export type logoutDTO = z.infer<typeof logoutSchema>;
