import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { ICouponService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { Coupon } from "../../DB/models/coupon.model";
import { OrderCoupon } from "../../DB/models/order.coupon.model";
import { addCouponDTO, updateCouponDTO } from "./coupon.dto";

export class CouponService implements ICouponService {
  constructor() {}

  // ============================ addCoupon ============================
  addCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      expiresAt,
      usageLimit,
      isActive,
    }: addCouponDTO = req.body;
    // step: check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ where: { code } });
    if (existingCoupon) {
      throw new AppError(HttpStatusCode.CONFLICT, "Coupon code already exists");
    }
    // step: create coupon
    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit,
      isActive,
    });
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Coupon created successfully",
      data: { coupon },
    });
  };

  // ============================ getCoupon ============================
  getCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;
    // step: find coupon
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Coupon not found");
    }
    return responseHandler({
      res,
      message: "Coupon retrieved successfully",
      data: { coupon },
    });
  };

  // ============================ updateCoupon ============================
  updateCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const {
      id,
      code,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      expiresAt,
      usageLimit,
      isActive,
    }: updateCouponDTO = req.body;
    // step: check if coupon exists
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Coupon not found");
    }
    // step: if code is being updated, check if new code already exists
    if (code && code !== coupon.get("code")) {
      const existingCoupon = await Coupon.findOne({ where: { code } });
      if (existingCoupon) {
        throw new AppError(
          HttpStatusCode.CONFLICT,
          "Coupon code already exists"
        );
      }
    }
    // step: update coupon
    await Coupon.update(
      {
        code,
        discountType,
        discountValue,
        maxDiscount,
        minOrderAmount,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        usageLimit,
        isActive,
      },
      { where: { id } }
    );
    // step: get updated coupon
    const updatedCoupon = await Coupon.findByPk(id);
    return responseHandler({
      res,
      message: "Coupon updated successfully",
      data: { coupon: updatedCoupon },
    });
  };

  // ============================ deleteCoupon ============================
  deleteCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;
    // step: check if coupon exists
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Coupon not found");
    }
    // step: check if coupon is being used in any orders
    const orderCouponCount = await OrderCoupon.count({
      where: { coupon_id: id },
    });
    if (orderCouponCount > 0) {
      throw new AppError(
        HttpStatusCode.CONFLICT,
        "Cannot delete coupon that has been used in orders"
      );
    }
    // step: delete coupon
    await Coupon.destroy({ where: { id } });
    return responseHandler({
      res,
      message: "Coupon deleted successfully",
      data: { deletedCouponId: id },
    });
  };
}
