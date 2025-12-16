import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { ICartService,  } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import {
  uploadMultiFilesS3,
  deleteMultiFilesS3,
  createPresignedUrlToGetFileS3,
} from "../../utils/S3-AWS/S3.services";

export class CartService implements ICartService {
  constructor() {}

  // ============================ addCart ============================
  addCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };

  // ============================ getCart ============================
  getCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };

  // ============================ updateCart ============================
  updateCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };

  // ============================ deleteCart ============================
  deleteCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
    });
  };
}
