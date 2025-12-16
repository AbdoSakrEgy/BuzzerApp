import z from "zod";
import {
  updateBasicInfoSchema,
  uploadProfileImageSchema,
} from "./customer.validation";

export type uploadProfileImageDTO = z.infer<typeof uploadProfileImageSchema>;
export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
