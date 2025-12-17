import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { IPaymentService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import Stripe from "stripe";
import {
  createCheckoutSession,
  createCoupon,
  createRefund,
} from "../../utils/stripe/stripe.service";
import { Coupon } from "../../DB/models/coupon.model";
import { Cart } from "../../DB/models/cart.model";
import { CartItem } from "../../DB/models/cart.item.model";
import { Product } from "../../DB/models/product.model";
import { Payment } from "../../DB/models/payment.model";
import { PaymentStatusEnum } from "../../types/global.types";
import { payWithStripeDTO, refundWithStripeDTO } from "./payment.dto";

export class PaymentService implements IPaymentService {
  constructor() {}

  // ============================ payWithStripe ============================
  payWithStripe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { userCoupons }: payWithStripeDTO = req.body;

    // step: check cart validation
    const userCart = await Cart.findOne({ where: { customer_id: user.id } });
    if (!userCart) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Cart not found");
    }
    const userCartItems = await CartItem.findAll({
      where: { cart_id: userCart.get("id") },
      include: [{ model: Product, as: "product" }],
    });
    if (userCartItems.length === 0) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Cart is empty");
    }

    // step: check coupons validation
    const coupons: Coupon[] = [];
    if (userCoupons && userCoupons.length > 0) {
      for (const uc of userCoupons) {
        const coupon = await Coupon.findOne({ where: { code: uc } });
        if (!coupon) {
          throw new AppError(
            HttpStatusCode.BAD_REQUEST,
            `Invalid coupon: ${uc}`
          );
        }
        coupons.push(coupon);
      }
    }

    // step: collect createCheckoutSession data
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    for (const coupon of coupons) {
      const discountItem = await createCoupon({
        duration: "once",
        currency: "egp",
        percent_off: coupon.discountValue,
      });
      discounts.push({ coupon: discountItem.id });
    }

    const line_items: any[] = [];
    userCartItems.forEach((item) => {
      const product = item.get("product") as any;
      if (product) {
        line_items.push({
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              description: product.description || "",
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.get("quantity") as number,
        });
      }
    });

    // step: create createCheckoutSession
    const checkoutSession = await createCheckoutSession({
      customer_email: user.email,
      line_items,
      mode: "payment",
      discounts,
      metadata: {
        userId: user.id.toString(),
        cartId: String(userCart.get("id")),
        ...(userCoupons && { coupons: userCoupons.join(",") }),
      },
    });

    // step: store checkoutSession ID for reference
    const totalAmount = line_items.reduce(
      (sum, item) => sum + (item.price_data.unit_amount / 100) * item.quantity,
      0
    );
    await Payment.create({
      customer_id: user.id,
      checkoutSessionId: checkoutSession.id,
      amount: totalAmount,
      status: PaymentStatusEnum.PENDING,
    });

    return responseHandler({ res, data: { checkoutSession } });
  };

  // ============================ webHookWithStripe ============================
  webHookWithStripe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const checkoutSessionId = req.body.data.object.id;
    const paymentIntentId = req.body.data.object.payment_intent;
    const { userId, cartId } = req.body.data.object.metadata;

    // step: find and update payment record
    const payment = await Payment.findOne({
      where: { checkoutSessionId },
    });
    if (!payment) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Payment not found");
    }

    await payment.update({
      paymentIntentId,
      status: PaymentStatusEnum.COMPLETED,
    });

    // step: create order from cart
    const Order = (await import("../../DB/models/order.model")).Order;
    const OrderItem = (await import("../../DB/models/order.item.model"))
      .OrderItem;

    const order = await Order.create({
      customer_id: parseInt(userId),
      totalAmount: payment.get("amount"),
      status: "paid",
      payment_id: payment.get("id"),
    });

    // step: copy cart items to order items
    const cartItems = await CartItem.findAll({
      where: { cart_id: parseInt(cartId) },
      include: [{ model: Product, as: "product" }],
    });

    for (const cartItem of cartItems) {
      const product = cartItem.get("product") as any;
      await OrderItem.create({
        order_id: order.get("id"),
        product_id: cartItem.get("product_id"),
        quantity: cartItem.get("quantity"),
        price: product?.price || 0,
      });
    }

    // step: clear the cart
    await CartItem.destroy({ where: { cart_id: parseInt(cartId) } });

    return responseHandler({
      res,
      message: "Payment successful, order created",
    });
  };

  // ============================ refundWithStripe ============================
  refundWithStripe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { paymentId }: refundWithStripeDTO = req.body;

    // step: find payment record
    const payment = await Payment.findOne({
      where: { id: paymentId, customer_id: user.id },
    });
    if (!payment) {
      throw new AppError(
        HttpStatusCode.NOT_FOUND,
        "Payment not found or you are not authorized"
      );
    }

    // step: check if payment is already refunded
    if (payment.get("status") === PaymentStatusEnum.REFUNDED) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Payment has already been refunded"
      );
    }

    // step: check if payment is completed
    if (payment.get("status") !== PaymentStatusEnum.COMPLETED) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Only completed payments can be refunded"
      );
    }

    // step: check if payment has paymentIntentId
    const paymentIntentId = payment.get("paymentIntentId") as string;
    if (!paymentIntentId) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Payment intent not found"
      );
    }

    // step: create refund in Stripe
    const refund = await createRefund(paymentIntentId);

    // step: update payment record
    await payment.update({
      refundId: refund.id,
      refundedAt: new Date(),
      status: PaymentStatusEnum.REFUNDED,
    });

    return responseHandler({
      res,
      message: "Payment refunded successfully",
      data: { refund },
    });
  };
}
