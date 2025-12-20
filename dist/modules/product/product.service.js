"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const response_handler_1 = require("../../core/handlers/response.handler");
const app_error_1 = require("../../core/errors/app.error");
const http_status_code_1 = require("../../core/http/http.status.code");
const product_model_1 = require("../../DB/models/product.model");
const product_validation_1 = require("./product.validation");
const S3_services_1 = require("../../utils/S3-AWS/S3.services");
class ProductService {
    constructor() { }
    // ============================ addProduct ============================
    addProduct = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate request body
        const parsed = product_validation_1.addProductSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { category_id, cafe_id, restaurant_id, name, description, price, availableQuantity, isAvailable, } = parsed.data;
        // step: upload product images if provided
        let images = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const imageKeys = await (0, S3_services_1.uploadMultiFilesS3)({
                dest: `products/${user.id}`,
                filesFromMulter: req.files,
            });
            // step: generate secure urls for each image
            images = await Promise.all(imageKeys.map(async (key) => ({
                public_id: key,
                secure_url: await (0, S3_services_1.createPresignedUrlToGetFileS3)({ Key: key }),
            })));
        }
        // step: create product
        const product = await product_model_1.Product.create({
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
        return (0, response_handler_1.responseHandler)({
            res,
            status: http_status_code_1.HttpStatusCode.CREATED,
            message: "Product created successfully",
            data: { product },
        });
    };
    // ============================ getProduct ============================
    getProduct = async (req, res, next) => {
        const { id } = req.params;
        // step: find product
        const product = await product_model_1.Product.findByPk(id);
        if (!product) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Product not found");
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Product retrieved successfully",
            data: { product },
        });
    };
    // ============================ allProducts ============================
    allProducts = async (req, res, next) => {
        const products = await product_model_1.Product.findAll();
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Product retrieved successfully",
            data: { products },
        });
    };
    // ============================ updateProduct ============================
    updateProduct = async (req, res, next) => {
        const user = res.locals.user;
        // step: validate request body
        const parsed = product_validation_1.updateProductSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, errors);
        }
        const { id, category_id, cafe_id, restaurant_id, name, description, price, availableQuantity, isAvailable, } = parsed.data;
        // step: check if product exists
        const product = await product_model_1.Product.findByPk(id);
        if (!product) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Product not found");
        }
        // step: get existing images
        const existingImages = product.get("images") || [];
        // step: upload new product images if provided
        let newImages = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const imageKeys = await (0, S3_services_1.uploadMultiFilesS3)({
                dest: `products/${user.id}`,
                filesFromMulter: req.files,
            });
            // step: generate secure urls for each image
            newImages = await Promise.all(imageKeys.map(async (key) => ({
                public_id: key,
                secure_url: await (0, S3_services_1.createPresignedUrlToGetFileS3)({ Key: key }),
            })));
        }
        // step: combine existing and new images
        const allImages = [...existingImages, ...newImages];
        // step: update product
        await product_model_1.Product.update({
            category_id,
            cafe_id,
            restaurant_id,
            name,
            description,
            price,
            availableQuantity,
            isAvailable,
            images: allImages,
        }, { where: { id } });
        // step: get updated product
        const updatedProduct = await product_model_1.Product.findByPk(id);
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Product updated successfully",
            data: { product: updatedProduct },
        });
    };
    // ============================ deleteProduct ============================
    deleteProduct = async (req, res, next) => {
        const { id } = req.params;
        // step: check if product exists
        const product = await product_model_1.Product.findByPk(id);
        if (!product) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Product not found");
        }
        // step: delete product images from S3
        const images = product.get("images") || [];
        if (images.length > 0) {
            const imageKeys = images.map((img) => img.public_id);
            await (0, S3_services_1.deleteMultiFilesS3)({ Keys: imageKeys });
        }
        // step: delete product
        await product_model_1.Product.destroy({ where: { id } });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Product deleted successfully",
            data: { deletedProductId: id },
        });
    };
}
exports.ProductService = ProductService;
