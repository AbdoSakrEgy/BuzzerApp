import z from "zod";
import {
  addCategorySchema,
  deleteAccountSchema,
  deleteCategorySchema,
  getCategorySchema,
  updateBasicInfoSchema,
  updateCategorySchema,
  uploadProfileImageSchema,
} from "./admin.validation";

export type deleteAccountDTO = z.infer<typeof deleteAccountSchema>;
export type uploadProfileImageDTO = z.infer<typeof uploadProfileImageSchema>;
export type updateBasicInfoDTO = z.infer<typeof updateBasicInfoSchema>;
export type addCategoryDTO = z.infer<typeof addCategorySchema>;
export type getCategoryDTO = z.infer<typeof getCategorySchema>;
export type updateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type deleteCategoryDTO = z.infer<typeof deleteCategorySchema>;
