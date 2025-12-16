import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { IOrderService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { Order } from "../../DB/models/order.model";
import { OrderItem } from "../../DB/models/order.item.model";
import { Cart } from "../../DB/models/cart.model";
import { CartItem } from "../../DB/models/cart.item.model";
import { Product } from "../../DB/models/product.model";
import { Customer } from "../../DB/models/customer.model";
import {
  addOrderSchema,
  updateOrderSchema,
  getOrdersSchema,
} from "./order.validation";
import { addOrderDTO, updateOrderDTO, getOrdersDTO } from "./order.dto";
import { sequelize } from "../../DB/db.connection";

export class OrderService implements IOrderService {
  constructor() {}

  // ============================ addOrder ============================
  addOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate request body
    const parsed = addOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const { notes }: addOrderDTO = parsed.data;
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
    // step: calculate total amount
    const totalAmount = cartItems.reduce(
      (sum: number, item: any) =>
        sum + parseFloat(item.product?.price || 0) * item.quantity,
      0
    );
    // step: create order using transaction
    const transaction = await sequelize.transaction();
    try {
      // step: create order
      const order = await Order.create(
        {
          customer_id: user.id,
          totalAmount: totalAmount.toFixed(2),
          status: "pending",
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
      // step: clear the cart
      await CartItem.destroy({
        where: { cart_id: cartData.id },
        transaction,
      });
      await transaction.commit();
      // step: fetch the complete order with items
      const createdOrder = await Order.findByPk(orderData.id, {
        include: [
          { model: OrderItem, include: [{ model: Product }] },
          { model: Customer },
        ],
      });
      return responseHandler({
        res,
        status: HttpStatusCode.CREATED,
        message: "Order placed successfully",
        data: {
          order: createdOrder,
          totalAmount: totalAmount.toFixed(2),
          itemsCount: cartItems.length,
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
    // step: find order with items
    const order = await Order.findByPk(order_id, {
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Customer },
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
    // step: find orders with pagination
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{ model: OrderItem, include: [{ model: Product }] }],
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
    // step: validate request body
    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const { order_id, status }: updateOrderDTO = parsed.data;
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
    if (orderData.status === "cancelled" || orderData.status === "refunded") {
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
    if (orderData.status !== "pending") {
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
        { status: "cancelled" },
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
