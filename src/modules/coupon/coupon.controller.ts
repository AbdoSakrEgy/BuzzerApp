import { Router } from "express";
import { auth } from "../../core/middlewares/auth.middleware";
import { CouponService } from "./coupon.service";
import { validation } from "../../core/middlewares/validation.middleware";
import {
  addCouponSchema,
  getCouponSchema,
  updateCouponSchema,
  deleteCouponSchema,
} from "./coupon.validation";

const router = Router();
const couponService = new CouponService();

router.post("/add-coupon",auth,validation(addCouponSchema),couponService.addCoupon);
router.get("/get-coupon/:id",auth,validation(getCouponSchema),couponService.getCoupon);
router.patch("/update-coupon",auth,validation(updateCouponSchema),couponService.updateCoupon);
router.delete("/delete-coupon/:id",auth,validation(deleteCouponSchema),couponService.deleteCoupon);

export default router;
