import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { IOrderService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { OrderStatusEnum } from "../../types/global.types";
import { Order } from "../../DB/models/order.model";
import { OrderItem } from "../../DB/models/order.item.model";
import { Cart } from "../../DB/models/cart.model";
import { CartItem } from "../../DB/models/cart.item.model";
import { Product } from "../../DB/models/product.model";
import { Customer } from "../../DB/models/customer.model";
import { Coupon } from "../../DB/models/coupon.model";
import { OrderCoupon } from "../../DB/models/order.coupon.model";
import { getOrdersSchema } from "./order.validation";
import { addOrderDTO, updateOrderDTO, getOrdersDTO } from "./order.dto";
import { sequelize } from "../../DB/db.connection";

export class OrderService implements IOrderService {
  constructor() {}

  // validateAndApplyCoupon
  private validateAndApplyCoupon = async (
    couponCode: string,
    orderAmount: number
  ): Promise<{ couponId: number; discountAmount: number; couponData: any }> => {
    // step: find coupon by code
    const coupon = await Coupon.findOne({ where: { code: couponCode } });
    if (!coupon) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Coupon not found");
    }
    const couponData = coupon.get({ plain: true }) as any;
    // step: check if coupon is active
    if (!couponData.isActive) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "This coupon is not active"
      );
    }
    // step: check if coupon has expired
    if (couponData.expiresAt && new Date(couponData.expiresAt) < new Date()) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "This coupon has expired");
    }
    // step: check if coupon has reached usage limit
    if (
      couponData.usageLimit &&
      couponData.usedCount >= couponData.usageLimit
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "This coupon has reached its usage limit"
      );
    }
    // step: check minimum order amount
    if (
      couponData.minOrderAmount &&
      orderAmount < parseFloat(couponData.minOrderAmount)
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        `Minimum order amount of ${couponData.minOrderAmount} required to use this coupon`
      );
    }
    // step: calculate discount amount
    let discountAmount = 0;
    if (couponData.discountType === "percentage") {
      discountAmount =
        (orderAmount * parseFloat(couponData.discountValue)) / 100;
      // Apply max discount cap if set
      if (
        couponData.maxDiscount &&
        discountAmount > parseFloat(couponData.maxDiscount)
      ) {
        discountAmount = parseFloat(couponData.maxDiscount);
      }
    } else {
      // Fixed discount
      discountAmount = parseFloat(couponData.discountValue);
    }
    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }
    return { couponId: couponData.id, discountAmount, couponData };
  };

  // ============================ addOrder ============================
  addOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { address_id, notes, couponCode }: addOrderDTO = req.body;
    // step: find customer's cart with items
    const cart = await Cart.findOne({
      where: { customer_id: user.id },
      include: [
        {
          model: CartItem,
          include: [{ model: Product }],
        },
      ],
    });
    if (!cart) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Cart not found");
    }
    const cartData = cart.get({ plain: true }) as any;
    const cartItems = cartData.cart_items || [];
    if (cartItems.length === 0) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Cart is empty. Add items to cart before placing an order"
      );
    }
    // step: validate all products are available
    for (const item of cartItems) {
      const product = item.product;
      if (!product) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          `Product with ID ${item.product_id} no longer exists`
        );
      }
      if (!product.isAvailable) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          `Product "${product.name}" is not available`
        );
      }
      if (product.availableQuantity < item.quantity) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          `Insufficient stock for "${product.name}". Only ${product.availableQuantity} available`
        );
      }
    }
    // step: calculate subtotal (original total amount)
    const subtotal = cartItems.reduce(
      (sum: number, item: any) =>
        sum + parseFloat(item.product?.price || 0) * item.quantity,
      0
    );
    // step: validate and apply coupon if provided
    let couponResult: {
      couponId: number;
      discountAmount: number;
      couponData: any;
    } | null = null;
    if (couponCode) {
      couponResult = await this.validateAndApplyCoupon(couponCode, subtotal);
    }
    // step: calculate final total amount
    const discountAmount = couponResult?.discountAmount || 0;
    const totalAmount = subtotal - discountAmount;
    // step: create order using transaction
    const transaction = await sequelize.transaction();
    try {
      // step: create order
      const order = await Order.create(
        {
          customer_id: user.id,
          totalAmount: totalAmount.toFixed(2),
          status: OrderStatusEnum.PENDING,
        },
        { transaction }
      );
      const orderData = order.get({ plain: true }) as any;
      // step: create order items
      const orderItems = [];
      for (const item of cartItems) {
        const orderItem = await OrderItem.create(
          {
            order_id: orderData.id,
            product_id: item.product_id,
            product_name: item.product.name,
            product_price: item.product.price,
            quantity: item.quantity,
          },
          { transaction }
        );
        orderItems.push(orderItem.get({ plain: true }));
        // step: update product available quantity
        await Product.update(
          {
            availableQuantity: item.product.availableQuantity - item.quantity,
          },
          { where: { id: item.product_id }, transaction }
        );
      }
      // step: create order_coupon record and increment coupon usage if coupon was applied
      if (couponResult) {
        await OrderCoupon.create(
          {
            order_id: orderData.id,
            coupon_id: couponResult.couponId,
            discountAmount: couponResult.discountAmount.toFixed(2),
          },
          { transaction }
        );
        // Increment coupon usage count
        await Coupon.update(
          { usedCount: couponResult.couponData.usedCount + 1 },
          { where: { id: couponResult.couponId }, transaction }
        );
      }
      // step: clear the cart
      await CartItem.destroy({
        where: { cart_id: cartData.id },
        transaction,
      });
      await transaction.commit();
      // step: fetch the complete order with items and coupon info
      const createdOrder = await Order.findByPk(orderData.id, {
        include: [
          { model: OrderItem, include: [{ model: Product }] },
          { model: Customer },
          { model: OrderCoupon, include: [{ model: Coupon }] },
        ],
      });
      return responseHandler({
        res,
        status: HttpStatusCode.CREATED,
        message: "Order placed successfully",
        data: {
          order: createdOrder,
          subtotal: subtotal.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          itemsCount: cartItems.length,
          couponApplied: couponResult ? couponResult.couponData.code : null,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // ============================ getOrder ============================
  getOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { order_id } = req.params;
    // step: find order with items and coupon info
    const order = await Order.findByPk(order_id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Customer },
        { model: OrderCoupon, include: [{ model: Coupon }] },
      ],
    });
    if (!order) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Order not found");
    }
    const orderData = order.get({ plain: true }) as any;
    // step: verify order belongs to the user
    if (orderData.customer_id !== user.id) {
      throw new AppError(
        HttpStatusCode.FORBIDDEN,
        "You don't have permission to view this order"
      );
    }
    return responseHandler({
      res,
      message: "Order retrieved successfully",
      data: { order: orderData },
    });
  };

  // ============================ getOrders ============================
  getOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate query params
    const parsed = getOrdersSchema.safeParse(req.query);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const { status, page, limit }: getOrdersDTO = parsed.data;
    // step: build where clause
    const whereClause: any = { customer_id: user.id };
    if (status) {
      whereClause.status = status;
    }
    // step: calculate pagination
    const offset = (page - 1) * limit;
    // step: find orders with pagination and coupon info
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: OrderCoupon, include: [{ model: Coupon }] },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });
    const totalPages = Math.ceil(count / limit);
    return responseHandler({
      res,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  };

  // ============================ updateOrder ============================
  updateOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { order_id, status }: updateOrderDTO = req.body;
    // step: find order
    const order = await Order.findByPk(order_id);
    if (!order) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Order not found");
    }
    const orderData = order.get({ plain: true }) as any;
    // step: verify order belongs to the user
    if (orderData.customer_id !== user.id) {
      throw new AppError(
        HttpStatusCode.FORBIDDEN,
        "You don't have permission to update this order"
      );
    }
    // step: validate status transition
    if (
      orderData.status === OrderStatusEnum.CANCELLED ||
      orderData.status === OrderStatusEnum.REFUNDED
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        `Cannot update order with status "${orderData.status}"`
      );
    }
    // step: update order status
    await Order.update({ status }, { where: { id: order_id } });
    const updatedOrder = await Order.findByPk(order_id, {
      include: [{ model: OrderItem, include: [{ model: Product }] }],
    });
    return responseHandler({
      res,
      message: "Order status updated successfully",
      data: { order: updatedOrder },
    });
  };

  // ============================ deleteOrder ============================
  deleteOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { order_id } = req.params;
    // step: find order with items
    const order = await Order.findByPk(order_id, {
      include: [{ model: OrderItem }],
    });
    if (!order) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Order not found");
    }
    const orderData = order.get({ plain: true }) as any;
    // step: verify order belongs to the user
    if (orderData.customer_id !== user.id) {
      throw new AppError(
        HttpStatusCode.FORBIDDEN,
        "You don't have permission to cancel this order"
      );
    }
    // step: check if order can be cancelled
    if (orderData.status !== OrderStatusEnum.PENDING) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        `Cannot cancel order with status "${orderData.status}". Only pending orders can be cancelled.`
      );
    }
    // step: restore product quantities and cancel order using transaction
    const transaction = await sequelize.transaction();
    try {
      const orderItems = orderData.order_items || [];
      // step: restore product quantities
      for (const item of orderItems) {
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            const productData = product.get({ plain: true }) as any;
            await Product.update(
              {
                availableQuantity:
                  productData.availableQuantity + item.quantity,
              },
              { where: { id: item.product_id }, transaction }
            );
          }
        }
      }
      // step: update order status to cancelled
      await Order.update(
        { status: OrderStatusEnum.CANCELLED },
        { where: { id: order_id }, transaction }
      );
      await transaction.commit();
      return responseHandler({
        res,
        message: "Order cancelled successfully",
        data: { cancelledOrderId: order_id },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
}
