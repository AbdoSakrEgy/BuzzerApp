import z from "zod";
import { RegisterEnum } from "../../types/auth.module.type";

export const registerSchema = z
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

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const confirmEmailSchema = z.object({
  email: z.email(),
  firstOtp: z.string(),
  secondOtp: z.string().optional(),
});

export const updateEmailSchema = z.object({
  newEmail: z.email(),
});

export const resendEmailOtpSchema = z.object({
  email: z.email(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

export const forgetPasswordSchema = z.object({
  email: z.email(),
});

export const changePasswordSchema = z.object({
  email: z.email(),
  otp: z.string(),
  newPassword: z.string(),
});

export const activeDeactive2FASchema = z.object({
  otp: z.string().optional(),
});

export const check2FAOTPSchema = z.object({
  userId: z.string(),
  otp: z.string(),
});
