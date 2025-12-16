import z from "zod";
import { GenderEnum, RegisterEnum } from "../../types/global.types";

export const registerSchema = z.object({
  phone: z.string(),
});

export const loginSchema = z.object({
  phone: z.string(),
});

export const registerCheckOtpSchema = z
  .object({
    type: z.literal([
      RegisterEnum.ADMIN,
      RegisterEnum.CUSTOMER,
      RegisterEnum.CAFE,
      RegisterEnum.RESTAURENT,
    ]),
    fullName: z.string().min(3).max(50),
    email: z.email().optional(),
    phone: z.string(),
    password: z.string(),
    otp: z.string(),
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

export const loginCheckOtpSchema = z.object({
  type: z.literal([
    RegisterEnum.ADMIN,
    RegisterEnum.CUSTOMER,
    RegisterEnum.CAFE,
    RegisterEnum.RESTAURENT,
  ]),
  phone: z.string(),
  otp: z.string(),
});

export const deleteAccountSchema = z.object({
  accountId: z.string(),
  accountType: z.string(),
});

export const uploadProfileImageSchema = z.object({
  profileImage: z.object(),
});

export const deleteMultiFilesSchema = z.object({
  Keys: z.array(z.string()),
  Quiet: z.boolean().optional(),
});

export const updateBasicInfoSchema = z.object({
  fullName: z.string().min(3).max(50).optional(),
  age: z.number().min(18).max(200).optional(),
  gender: z.literal([GenderEnum.MALE, GenderEnum.FEMALE]).optional(),
  email: z.email().optional(),
});

export const logoutSchema = z.object({
  type: z.literal([
    RegisterEnum.ADMIN,
    RegisterEnum.CUSTOMER,
    RegisterEnum.CAFE,
    RegisterEnum.RESTAURENT,
  ]),
});
