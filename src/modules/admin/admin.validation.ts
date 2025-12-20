import z from "zod";
import { GenderEnum } from "../../types/global.types";

export const deleteAccountSchema = z.object({
  accountId: z.string(),
  accountType: z.string(),
});

export const uploadProfileImageSchema = z.object({
  profileImage: z.object(),
});

export const updateBasicInfoSchema = z
  .object({
    fullName: z.string().min(3).max(50).optional(),
    age: z.number().min(18).max(200).optional(),
    gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
  })
  .superRefine((args, ctx) => {
    if (args.phone) {
      const clean = args.phone.replace(/[\s-]/g, "");
      const phoneRegex = /^\+?[1-9]\d{7,14}$/;
      if (!phoneRegex.test(clean)) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Phone number is incorrect",
        });
      }
    }
    if (args.email) {
      if (args.email == "zzzzz@gmail.com") {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message:
            "zzzzz@gmail.com not valid email to use :), test custom validation",
        });
      }
    }
  });

export const addCategorySchema = z.object({
  name: z.string().min(3).max(20),
  description: z.string().min(3).max(300),
});

export const getCategorySchema = z.object({
  name: z.string().min(3).max(20),
});

export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(20).optional(),
  description: z.string().min(3).max(300).optional(),
});

export const deleteCategorySchema = z.object({
  id: z.string(),
});
