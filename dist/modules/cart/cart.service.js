"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const cart_model_1 = require("../../DB/models/cart.model");
const cart_item_model_1 = require("../../DB/models/cart.item.model");
const product_model_1 = require("../../DB/models/product.model");
const cart_validation_1 = require("./cart.validation");
class CartService {
    constructor() { }
    // ============================ addCart ============================
    // Add item to cart (creates cart if not exists)
    addCart = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate request body
        const parsed = cart_validation_1.addCartSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { product_id, quantity } = parsed.data;
        // step: check if product exists and is available
        const product = await product_model_1.Product.findByPk(product_id);
        if (!product) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Product not found");
        }
        const productData = product.get({ plain: true });
        if (!productData.isAvailable) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Product is not available");
        }
        if (productData.availableQuantity < quantity) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Only ${productData.availableQuantity} items available in stock`);
        }
        // step: find or create cart for the customer
        let cart = await cart_model_1.Cart.findOne({ where: { customer_id: user.id } });
        if (!cart) {
            cart = await cart_model_1.Cart.create({ customer_id: user.id });
        }
        const cartData = cart.get({ plain: true });
        // step: check if item already exists in cart
        const existingCartItem = await cart_item_model_1.CartItem.findOne({
            where: { cart_id: cartData.id, product_id },
        });
        if (existingCartItem) {
            // step: update quantity if item exists
            const existingData = existingCartItem.get({ plain: true });
            const newQuantity = existingData.quantity + quantity;
            if (productData.availableQuantity < newQuantity) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Cannot add more items. Only ${productData.availableQuantity} items available in stock`);
            }
            await cart_item_model_1.CartItem.update({ quantity: newQuantity }, { where: { id: existingData.id } });
            const updatedCartItem = await cart_item_model_1.CartItem.findByPk(existingData.id, {
                include: [{ model: product_model_1.Product }],
            });
            return (0, response_handler_1.responseHandler)({
                res,
                status: http_status_code_1.HttpStatusCode.OK,
                message: "Cart item quantity updated",
                data: { cartItem: updatedCartItem },
            });
        }
        // step: create new cart item
        const cartItem = await cart_item_model_1.CartItem.create({
            cart_id: cartData.id,
            product_id,
            quantity,
        });
        const createdCartItem = await cart_item_model_1.CartItem.findByPk(cartItem.get({ plain: true }).id, { include: [{ model: product_model_1.Product }] });
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.CREATED,
            message: "Item added to cart successfully",
            data: { cartItem: createdCartItem },
        });
    };
    // ============================ getCart ============================
    getCart = async (req, res, next) => {
        const user = res.locals.user;
        // step: find cart with all items and products
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
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Cart is empty",
                data: { cart: null, items: [], totalItems: 0, totalPrice: 0 },
            });
        }
        const cartData = cart.get({ plain: true });
        // step: calculate totals
        const items = cartData.cart_items || [];
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity, 0);
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Cart retrieved successfully",
            data: {
                cart: cartData,
                items,
                totalItems,
                totalPrice: totalPrice.toFixed(2),
            },
        });
    };
    // ============================ updateCart ============================
    updateCart = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate request body
        const parsed = cart_validation_1.updateCartSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { cart_item_id, quantity } = parsed.data;
        // step: find the cart item and verify ownership
        const cartItem = await cart_item_model_1.CartItem.findByPk(cart_item_id, {
            include: [{ model: cart_model_1.Cart }, { model: product_model_1.Product }],
        });
        if (!cartItem) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Cart item not found");
        }
        const cartItemData = cartItem.get({ plain: true });
        // step: verify cart belongs to the user
        if (cartItemData.cart?.customer_id !== user.id) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.FORBIDDEN, "You don't have permission to update this cart item");
        }
        // step: check stock availability
        const productData = cartItemData.product;
        if (productData && productData.availableQuantity < quantity) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, `Only ${productData.availableQuantity} items available in stock`);
        }
        // step: update cart item quantity
        await cart_item_model_1.CartItem.update({ quantity }, { where: { id: cart_item_id } });
        const updatedCartItem = await cart_item_model_1.CartItem.findByPk(cart_item_id, {
            include: [{ model: product_model_1.Product }],
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Cart item updated successfully",
            data: { cartItem: updatedCartItem },
        });
    };
    // ============================ deleteCart ============================
    // Delete a single cart item
    deleteCart = async (req, res, next) => {
        const user = res.locals.user;
        const { cart_item_id } = req.params;
        // step: find the cart item and verify ownership
        const cartItem = await cart_item_model_1.CartItem.findByPk(cart_item_id, {
            include: [{ model: cart_model_1.Cart }],
        });
        if (!cartItem) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Cart item not found");
        }
        const cartItemData = cartItem.get({ plain: true });
        // step: verify cart belongs to the user
        if (cartItemData.cart?.customer_id !== user.id) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.FORBIDDEN, "You don't have permission to delete this cart item");
        }
        // step: delete cart item
        await cart_item_model_1.CartItem.destroy({ where: { id: cart_item_id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Cart item removed successfully",
            data: { deletedCartItemId: cart_item_id },
        });
    };
    // ============================ clearCart ============================
    // Clear all items from cart
    clearCart = async (req, res, next) => {
        const user = res.locals.user;
        // step: find cart
        const cart = await cart_model_1.Cart.findOne({ where: { customer_id: user.id } });
        if (!cart) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Cart not found");
        }
        const cartData = cart.get({ plain: true });
        // step: delete all cart items
        await cart_item_model_1.CartItem.destroy({ where: { cart_id: cartData.id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Cart cleared successfully",
            data: { clearedCartId: cartData.id },
        });
    };
}
exports.CartService = CartService;
