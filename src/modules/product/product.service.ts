import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { IProductService } from "../../types/modules.interfaces";

export class ProductService implements IProductService {
  constructor() {}

  // ============================ addProduct ============================
  addProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };

  // ============================ getProduct ============================
  getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };

  // ============================ updateProduct ============================
  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };

  // ============================ deleteProduct ============================
  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };
}
