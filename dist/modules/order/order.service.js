"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const global_types_1 = require("../../types/global.types");
const order_model_1 = require("../../DB/models/order.model");
const order_item_model_1 = require("../../DB/models/order.item.model");
const cart_model_1 = require("../../DB/models/cart.model");
const cart_item_model_1 = require("../../DB/models/cart.item.model");
const product_model_1 = require("../../DB/models/product.model");
const customer_model_1 = require("../../DB/models/customer.model");
const coupon_model_1 = require("../../DB/models/coupon.model");
const order_coupon_model_1 = require("../../DB/models/order.coupon.model");
const db_connection_1 = require("../../DB/db.connection");
class OrderService {
    constructor() { }
    // validateAndApplyCoupon
    validateAndApplyCoupon = async (couponCode, orderAmount) => {
        // step: find coupon by code
        const coupon = await coupon_model_1.Coupon.findOne({ where: { code: couponCode } });
        if (!coupon) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Coupon not found");
        }
        const couponData = coupon.get({ plain: true });
        // step: check if coupon is active
        if (!couponData.isActive) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "This coupon is not active");
        }
        // step: check if coupon has expired
        if (couponData.expiresAt && new Date(couponData.expiresAt) < new Date()) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "This coupon has expired");
        }
        // step: check if coupon has reached usage limit
        if (couponData.usageLimit &&
            couponData.usedCount >= couponData.usageLimit) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "This coupon has reached its usage limit");
        }
        // step: check minimum order amount
        if (couponData.minOrderAmount &&
            orderAmount < parseFloat(couponData.minOrderAmount)) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Minimum order amount of ${couponData.minOrderAmount} required to use this coupon`);
        }
        // step: calculate discount amount
        let discountAmount = 0;
        if (couponData.discountType === "percentage") {
            discountAmount =
                (orderAmount * parseFloat(couponData.discountValue)) / 100;
            // Apply max discount cap if set
            if (couponData.maxDiscount &&
                discountAmount > parseFloat(couponData.maxDiscount)) {
                discountAmount = parseFloat(couponData.maxDiscount);
            }
        }
        else {
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
    addOrder = async (req, res, next) => {
        const user = res.locals.user;
        const { address_id, notes, couponCode } = req.body;
        // step: find customer's cart with items
        const cart = await cart_model_1.Cart.findOne({
            where: { customer_id: user.id },
            include: [
                {
                    model: cart_item_model_1.CartItem,
                    include: [{ model: product_model_1.Product }],
                },
            ],
        });
        if (!cart) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Cart not found");
        }
        const cartData = cart.get({ plain: true });
        const cartItems = cartData.cart_items || [];
        if (cartItems.length === 0) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Cart is empty. Add items to cart before placing an order");
        }
        // step: validate all products are available
        for (const item of cartItems) {
            const product = item.product;
            if (!product) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Product with ID ${item.product_id} no longer exists`);
            }
            if (!product.isAvailable) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Product "${product.name}" is not available`);
            }
            if (product.availableQuantity < item.quantity) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Insufficient stock for "${product.name}". Only ${product.availableQuantity} available`);
            }
        }
        // step: calculate subtotal (original total amount)
        const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity, 0);
        // step: validate and apply coupon if provided
        let couponResult = null;
        if (couponCode) {
            couponResult = await this.validateAndApplyCoupon(couponCode, subtotal);
        }
        // step: calculate final total amount
        const discountAmount = couponResult?.discountAmount || 0;
        const totalAmount = subtotal - discountAmount;
        // step: create order using transaction
        const transaction = await db_connection_1.sequelize.transaction();
        try {
            // step: create order
            const order = await order_model_1.Order.create({
                customer_id: user.id,
                totalAmount: totalAmount.toFixed(2),
                status: global_types_1.OrderStatusEnum.PENDING,
            }, { transaction });
            const orderData = order.get({ plain: true });
            // step: create order items
            const orderItems = [];
            for (const item of cartItems) {
                const orderItem = await order_item_model_1.OrderItem.create({
                    order_id: orderData.id,
                    product_id: item.product_id,
                    product_name: item.product.name,
                    product_price: item.product.price,
                    quantity: item.quantity,
                }, { transaction });
                orderItems.push(orderItem.get({ plain: true }));
                // step: update product available quantity
                await product_model_1.Product.update({
                    availableQuantity: item.product.availableQuantity - item.quantity,
                }, { where: { id: item.product_id }, transaction });
            }
            // step: create order_coupon record and increment coupon usage if coupon was applied
            if (couponResult) {
                await order_coupon_model_1.OrderCoupon.create({
                    order_id: orderData.id,
                    coupon_id: couponResult.couponId,
                    discountAmount: couponResult.discountAmount.toFixed(2),
                }, { transaction });
                // Increment coupon usage count
                await coupon_model_1.Coupon.update({ usedCount: couponResult.couponData.usedCount + 1 }, { where: { id: couponResult.couponId }, transaction });
            }
            // step: clear the cart
            await cart_item_model_1.CartItem.destroy({
                where: { cart_id: cartData.id },
                transaction,
            });
            await transaction.commit();
            // step: fetch the complete order with items and coupon info
            const createdOrder = await order_model_1.Order.findByPk(orderData.id, {
                include: [
                    { model: order_item_model_1.OrderItem, include: [{ model: product_model_1.Product }] },
                    { model: customer_model_1.Customer },
                    { model: order_coupon_model_1.OrderCoupon, include: [{ model: coupon_model_1.Coupon }] },
                ],
            });
            return (0, response_handler_1.responseHandler)({
                res,
                status: http_status_code_1.HttpStatusCode.CREATED,
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
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    };
    // ============================ getOrder ============================
    getOrder = async (req, res, next) => {
        const user = res.locals.user;
        const { order_id } = req.params;
        // step: find order with items and coupon info
        const order = await order_model_1.Order.findByPk(order_id, {
            include: [
                { model: order_item_model_1.OrderItem, include: [{ model: product_model_1.Product }] },
                { model: customer_model_1.Customer },
                { model: order_coupon_model_1.OrderCoupon, include: [{ model: coupon_model_1.Coupon }] },
            ],
        });
        if (!order) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Order not found");
        }
        const orderData = order.get({ plain: true });
        // step: verify order belongs to the user
        if (orderData.customer_id !== user.id) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.FORBIDDEN, "You don't have permission to view this order");
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Order retrieved successfully",
            data: { order: orderData },
        });
    };
    // ============================ getOrders ============================
    getOrders = async (req, res, next) => {
        const user = res.locals.user;
        const orders = await order_model_1.Order.findAll({ where: { customer_id: user.id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Orders retrieved successfully",
            data: { orders },
        });
    };
    // ============================ updateOrder ============================
    updateOrder = async (req, res, next) => {
        const user = res.locals.user;
        const { order_id, status } = req.body;
        // step: find order
        const order = await order_model_1.Order.findByPk(order_id);
        if (!order) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Order not found");
        }
        const orderData = order.get({ plain: true });
        // step: verify order belongs to the user
        if (orderData.customer_id !== user.id) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.FORBIDDEN, "You don't have permission to update this order");
        }
        // step: validate status transition
        if (orderData.status === global_types_1.OrderStatusEnum.CANCELLED ||
            orderData.status === global_types_1.OrderStatusEnum.REFUNDED) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Cannot update order with status "${orderData.status}"`);
        }
        // step: update order status
        await order_model_1.Order.update({ status }, { where: { id: order_id } });
        const updatedOrder = await order_model_1.Order.findByPk(order_id, {
            include: [{ model: order_item_model_1.OrderItem, include: [{ model: product_model_1.Product }] }],
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Order status updated successfully",
            data: { order: updatedOrder },
        });
    };
    // ============================ deleteOrder ============================
    deleteOrder = async (req, res, next) => {
        const user = res.locals.user;
        const { order_id } = req.params;
        // step: find order with items
        const order = await order_model_1.Order.findByPk(order_id, {
            include: [{ model: order_item_model_1.OrderItem }],
        });
        if (!order) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Order not found");
        }
        const orderData = order.get({ plain: true });
        // step: verify order belongs to the user
        if (orderData.customer_id !== user.id) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.FORBIDDEN, "You don't have permission to cancel this order");
        }
        // step: check if order can be cancelled
        if (orderData.status !== global_types_1.OrderStatusEnum.PENDING) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Cannot cancel order with status "${orderData.status}". Only pending orders can be cancelled.`);
        }
        // step: restore product quantities and cancel order using transaction
        const transaction = await db_connection_1.sequelize.transaction();
        try {
            const orderItems = orderData.order_items || [];
            // step: restore product quantities
            for (const item of orderItems) {
                if (item.product_id) {
                    const product = await product_model_1.Product.findByPk(item.product_id);
                    if (product) {
                        const productData = product.get({ plain: true });
                        await product_model_1.Product.update({
                            availableQuantity: productData.availableQuantity + item.quantity,
                        }, { where: { id: item.product_id }, transaction });
                    }
                }
            }
            // step: update order status to cancelled
            await order_model_1.Order.update({ status: global_types_1.OrderStatusEnum.CANCELLED }, { where: { id: order_id }, transaction });
            await transaction.commit();
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Order cancelled successfully",
                data: { cancelledOrderId: order_id },
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    };
}
exports.OrderService = OrderService;
