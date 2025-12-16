import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { ICartService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { Cart } from "../../DB/models/cart.model";
import { CartItem } from "../../DB/models/cart.item.model";
import { Product } from "../../DB/models/product.model";
import { addCartSchema, updateCartSchema } from "./cart.validation";
import { addCartDTO, updateCartDTO } from "./cart.dto";

export class CartService implements ICartService {
  constructor() {}

  // ============================ addCart ============================
  // Add item to cart (creates cart if not exists)
  addCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate request body
    const parsed = addCartSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const { product_id, quantity }: addCartDTO = parsed.data;
    // step: check if product exists and is available
    const product = await Product.findByPk(product_id);
    if (!product) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    const productData = product.get({ plain: true }) as any;
    if (!productData.isAvailable) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Product is not available"
      );
    }
    if (productData.availableQuantity < quantity) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        `Only ${productData.availableQuantity} items available in stock`
      );
    }
    // step: find or create cart for the customer
    let cart = await Cart.findOne({ where: { customer_id: user.id } });
    if (!cart) {
      cart = await Cart.create({ customer_id: user.id });
    }
    const cartData = cart.get({ plain: true }) as any;
    // step: check if item already exists in cart
    const existingCartItem = await CartItem.findOne({
      where: { cart_id: cartData.id, product_id },
    });
    if (existingCartItem) {
      // step: update quantity if item exists
      const existingData = existingCartItem.get({ plain: true }) as any;
      const newQuantity = existingData.quantity + quantity;
      if (productData.availableQuantity < newQuantity) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          `Cannot add more items. Only ${productData.availableQuantity} items available in stock`
        );
      }
      await CartItem.update(
        { quantity: newQuantity },
        { where: { id: existingData.id } }
      );
      const updatedCartItem = await CartItem.findByPk(existingData.id, {
        include: [{ model: Product }],
      });
      return responseHandler({
        res,
        status: HttpStatusCode.OK,
        message: "Cart item quantity updated",
        data: { cartItem: updatedCartItem },
      });
    }
    // step: create new cart item
    const cartItem = await CartItem.create({
      cart_id: cartData.id,
      product_id,
      quantity,
    });
    const createdCartItem = await CartItem.findByPk(
      (cartItem.get({ plain: true }) as any).id,
      { include: [{ model: Product }] }
    );
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Item added to cart successfully",
      data: { cartItem: createdCartItem },
    });
  };

  // ============================ getCart ============================
  getCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: find cart with all items and products
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
      return responseHandler({
        res,
        message: "Cart is empty",
        data: { cart: null, items: [], totalItems: 0, totalPrice: 0 },
      });
    }
    const cartData = cart.get({ plain: true }) as any;
    // step: calculate totals
    const items = cartData.cart_items || [];
    const totalItems = items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );
    const totalPrice = items.reduce(
      (sum: number, item: any) =>
        sum + parseFloat(item.product?.price || 0) * item.quantity,
      0
    );
    return responseHandler({
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
  updateCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate request body
    const parsed = updateCartSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const { cart_item_id, quantity }: updateCartDTO = parsed.data;
    // step: find the cart item and verify ownership
    const cartItem = await CartItem.findByPk(cart_item_id, {
      include: [{ model: Cart }, { model: Product }],
    });
    if (!cartItem) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Cart item not found");
    }
    const cartItemData = cartItem.get({ plain: true }) as any;
    // step: verify cart belongs to the user
    if (cartItemData.cart?.customer_id !== user.id) {
      throw new AppError(
        HttpStatusCode.FORBIDDEN,
        "You don't have permission to update this cart item"
      );
    }
    // step: check stock availability
    const productData = cartItemData.product;
    if (productData && productData.availableQuantity < quantity) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        `Only ${productData.availableQuantity} items available in stock`
      );
    }
    // step: update cart item quantity
    await CartItem.update({ quantity }, { where: { id: cart_item_id } });
    const updatedCartItem = await CartItem.findByPk(cart_item_id, {
      include: [{ model: Product }],
    });
    return responseHandler({
      res,
      message: "Cart item updated successfully",
      data: { cartItem: updatedCartItem },
    });
  };

  // ============================ deleteCart ============================
  // Delete a single cart item
  deleteCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { cart_item_id } = req.params;
    // step: find the cart item and verify ownership
    const cartItem = await CartItem.findByPk(cart_item_id, {
      include: [{ model: Cart }],
    });
    if (!cartItem) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Cart item not found");
    }
    const cartItemData = cartItem.get({ plain: true }) as any;
    // step: verify cart belongs to the user
    if (cartItemData.cart?.customer_id !== user.id) {
      throw new AppError(
        HttpStatusCode.FORBIDDEN,
        "You don't have permission to delete this cart item"
      );
    }
    // step: delete cart item
    await CartItem.destroy({ where: { id: cart_item_id } });
    return responseHandler({
      res,
      message: "Cart item removed successfully",
      data: { deletedCartItemId: cart_item_id },
    });
  };

  // ============================ clearCart ============================
  // Clear all items from cart
  clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: find cart
    const cart = await Cart.findOne({ where: { customer_id: user.id } });
    if (!cart) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Cart not found");
    }
    const cartData = cart.get({ plain: true }) as any;
    // step: delete all cart items
    await CartItem.destroy({ where: { cart_id: cartData.id } });
    return responseHandler({
      res,
      message: "Cart cleared successfully",
      data: { clearedCartId: cartData.id },
    });
  };
}
