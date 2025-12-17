import z from "zod";
import {
  addCouponSchema,
  deleteCouponSchema,
  getCouponSchema,
  updateCouponSchema,
} from "./coupon.validation";

export type addCouponDTO = z.infer<typeof addCouponSchema>;
export type getCouponDTO = z.infer<typeof getCouponSchema>;
export type updateCouponDTO = z.infer<typeof updateCouponSchema>;
export type deleteCouponDTO = z.infer<typeof deleteCouponSchema>;
