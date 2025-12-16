import z from "zod";
import { GenderEnum, PricingPlanEnum } from "../../types/user.module.type";

export const uploadProfileImageSchema = z.object({
  profileImage: z.object(),
});

export const uploadProfileVideoSchema = z.object({
  profileVideo: z.object(),
});

export const uploadAvatarImageSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
});

export const uploadCoverImagesSchema = z.object({
  coverImages: z.array(z.object()),
});

export const createPresignedUrlToGetFileSchema = z.object({
  download: z.boolean().optional(),
  downloadName: z.string().optional(),
});

export const deleteMultiFilesSchema = z.object({
  Keys: z.array(z.string()),
  Quiet: z.boolean().optional(),
});

export const updateBasicInfoSchema = z.object({
  firstName: z.string().min(3).max(50).optional(),
  lastName: z.string().min(3).max(50).optional(),
  age: z.number().min(18).max(200).optional(),
  gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
  phone: z.string().optional(),
});
