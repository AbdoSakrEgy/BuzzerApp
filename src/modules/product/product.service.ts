import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { IProductService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { Product } from "../../DB/models/product.model";
import { addProductSchema, updateProductSchema } from "./product.validation";
import {
  uploadMultiFilesS3,
  deleteMultiFilesS3,
  createPresignedUrlToGetFileS3,
} from "../../utils/S3-AWS/S3.services";
import { addProductDTO, updateProductDTO } from "./product.dto";

interface ProductImage {
  public_id: string;
  secure_url: string;
}

export class ProductService implements IProductService {
  constructor() {}

  // ============================ addProduct ============================
  addProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate request body
    const parsed = addProductSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const {
      category_id,
      cafe_id,
      restaurant_id,
      name,
      description,
      price,
      availableQuantity,
      isAvailable,
    }: addProductDTO = parsed.data;
    // step: upload product images if provided
    let images: ProductImage[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageKeys = await uploadMultiFilesS3({
        dest: `products/${user.id}`,
        filesFromMulter: req.files as Express.Multer.File[],
      });
      // step: generate secure urls for each image
      images = await Promise.all(
        imageKeys.map(async (key) => ({
          public_id: key,
          secure_url: await createPresignedUrlToGetFileS3({ Key: key }),
        }))
      );
    }
    // step: create product
    const product = await Product.create({
      category_id,
      cafe_id,
      restaurant_id,
      name,
      description,
      price,
      availableQuantity,
      isAvailable,
      images,
    });
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Product created successfully",
      data: { product },
    });
  };

  // ============================ getProduct ============================
  getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;
    // step: find product
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    return responseHandler({
      res,
      message: "Product retrieved successfully",
      data: { product },
    });
  };

  // ============================ updateProduct ============================
  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate request body
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const {
      id,
      category_id,
      cafe_id,
      restaurant_id,
      name,
      description,
      price,
      availableQuantity,
      isAvailable,
    }: updateProductDTO = parsed.data;
    // step: check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    // step: get existing images
    const existingImages = (product.get("images") as ProductImage[]) || [];
    // step: upload new product images if provided
    let newImages: ProductImage[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageKeys = await uploadMultiFilesS3({
        dest: `products/${user.id}`,
        filesFromMulter: req.files as Express.Multer.File[],
      });
      // step: generate secure urls for each image
      newImages = await Promise.all(
        imageKeys.map(async (key) => ({
          public_id: key,
          secure_url: await createPresignedUrlToGetFileS3({ Key: key }),
        }))
      );
    }
    // step: combine existing and new images
    const allImages = [...existingImages, ...newImages];
    // step: update product
    await Product.update(
      {
        category_id,
        cafe_id,
        restaurant_id,
        name,
        description,
        price,
        availableQuantity,
        isAvailable,
        images: allImages,
      },
      { where: { id } }
    );
    // step: get updated product
    const updatedProduct = await Product.findByPk(id);
    return responseHandler({
      res,
      message: "Product updated successfully",
      data: { product: updatedProduct },
    });
  };

  // ============================ deleteProduct ============================
  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;
    // step: check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Product not found");
    }
    // step: delete product images from S3
    const images = (product.get("images") as ProductImage[]) || [];
    if (images.length > 0) {
      const imageKeys = images.map((img) => img.public_id);
      await deleteMultiFilesS3({ Keys: imageKeys });
    }
    // step: delete product
    await Product.destroy({ where: { id } });
    return responseHandler({
      res,
      message: "Product deleted successfully",
      data: { deletedProductId: id },
    });
  };
}
