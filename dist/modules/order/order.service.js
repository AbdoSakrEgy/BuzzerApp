"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const order_model_1 = require("../../DB/models/order.model");
const order_item_model_1 = require("../../DB/models/order.item.model");
const cart_model_1 = require("../../DB/models/cart.model");
const cart_item_model_1 = require("../../DB/models/cart.item.model");
const product_model_1 = require("../../DB/models/product.model");
const customer_model_1 = require("../../DB/models/customer.model");
const order_validation_1 = require("./order.validation");
const db_connection_1 = require("../../DB/db.connection");
class OrderService {
    constructor() { }
    // ============================ addOrder ============================
    addOrder = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate request body
        const parsed = order_validation_1.addOrderSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { notes } = parsed.data;
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
        // step: calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity, 0);
        // step: create order using transaction
        const transaction = await db_connection_1.sequelize.transaction();
        try {
            // step: create order
            const order = await order_model_1.Order.create({
                customer_id: user.id,
                totalAmount: totalAmount.toFixed(2),
                status: "pending",
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
            // step: clear the cart
            await cart_item_model_1.CartItem.destroy({
                where: { cart_id: cartData.id },
                transaction,
            });
            await transaction.commit();
            // step: fetch the complete order with items
            const createdOrder = await order_model_1.Order.findByPk(orderData.id, {
                include: [
                    { model: order_item_model_1.OrderItem, include: [{ model: product_model_1.Product }] },
                    { model: customer_model_1.Customer },
                ],
            });
            return (0, response_handler_1.responseHandler)({
                res,
                status: http_status_code_1.HttpStatusCode.CREATED,
                message: "Order placed successfully",
                data: {
                    order: createdOrder,
                    totalAmount: totalAmount.toFixed(2),
                    itemsCount: cartItems.length,
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
        // step: find order with items
        const order = await order_model_1.Order.findByPk(order_id, {
            include: [
                { model: order_item_model_1.OrderItem, include: [{ model: product_model_1.Product }] },
                { model: customer_model_1.Customer },
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
        // step: validate query params
        const parsed = order_validation_1.getOrdersSchema.safeParse(req.query);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { status, page, limit } = parsed.data;
        // step: build where clause
        const whereClause = { customer_id: user.id };
        if (status) {
            whereClause.status = status;
        }
        // step: calculate pagination
        const offset = (page - 1) * limit;
        // step: find orders with pagination
        const { count, rows: orders } = await order_model_1.Order.findAndCountAll({
            where: whereClause,
            include: [{ model: order_item_model_1.OrderItem, include: [{ model: product_model_1.Product }] }],
            limit,
            offset,
            order: [["id", "DESC"]],
        });
        const totalPages = Math.ceil(count / limit);
        return (0, response_handler_1.responseHandler)({
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
    updateOrder = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate request body
        const parsed = order_validation_1.updateOrderSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { order_id, status } = parsed.data;
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
        if (orderData.status === "cancelled" || orderData.status === "refunded") {
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
        if (orderData.status !== "pending") {
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
            await order_model_1.Order.update({ status: "cancelled" }, { where: { id: order_id }, transaction });
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
