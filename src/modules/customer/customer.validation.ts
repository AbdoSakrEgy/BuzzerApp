import z from "zod";
import { GenderEnum } from "../../types/global.types";

export const uploadProfileImageSchema = z.object({
  profileImage: z.object(),
});

export const updateBasicInfoSchema = z.object({
  fullName: z.string().min(3).max(50).optional(),
  age: z.number().min(18).max(200).optional(),
  gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
  email: z.email().optional(),
});
