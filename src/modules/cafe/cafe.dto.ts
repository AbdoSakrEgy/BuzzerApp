import z from "zod";
import {
  updateBasicInfoSchema,
  uploadProfileImageSchema,
} from "./cafe.validation";

export type uploadProfileImageDTO = z.infer<typeof uploadProfileImageSchema>;
export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
