import z from "zod";
import {
  loginCheckOtpSchema,
  loginSchema,
  logoutSchema,
  registerCheckOtpSchema,
  registerSchema,
} from "./auth.validation";

export type registerDTO = z.infer<typeof registerSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
export type registerCheckOtpDTO = z.infer<typeof registerCheckOtpSchema>;
export type logincheckOtpDTO = z.infer<typeof loginCheckOtpSchema>;
export type logoutDTO = z.infer<typeof logoutSchema>;
