import { NextFunction, Request, Response } from "express";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { responseHandler } from "../../core/handlers/response.handler";
import {
  deleteMultiFilesDTO,
  loginDTO,
  logoutDTO,
  registerDTO,
} from "./auth.dto";
import { createJwt } from "../../utils/jwt";
import { createOtp } from "../../utils/createOtp";
import { Admin } from "../../DB/models/admin.model";
import { decodeToken, TokenTypesEnum } from "../../utils/decodeToken";
import {
  createPresignedUrlToGetFileS3,
  deleteFileS3,
  deleteMultiFilesS3,
} from "../../utils/S3-AWS/S3.services";
import { Customer } from "../../DB/models/customer.model";
import { Cafe } from "../../DB/models/cafe.model";
import { Restaurant } from "../../DB/models/restaurant.model";
import { IAdminService } from "../../types/modules.interfaces";
import { RegisterEnum } from "../../types/global.types";

export class AdminService implements IAdminService {
  constructor() {}

  // ============================ register ============================
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type, fullName, email, phone, password }: registerDTO = req.body;
    let UserModel: any;
    if (type == RegisterEnum.ADMIN) {
      UserModel = Admin;
    } else if (type == RegisterEnum.CUSTOMER) {
      UserModel = Customer;
    } else if (type == RegisterEnum.CAFE) {
      UserModel = Cafe;
    } else if (type == RegisterEnum.RESTAURENT) {
      UserModel = Restaurant;
    }
    // step: check if email already exists
    const checkUserWithEmail = await UserModel.findOne({ where: { email } });
    if (checkUserWithEmail) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "User with this email already exists"
      );
    }
    // step: check if phone already exists
    const checkUserWithPhone = await UserModel.findOne({ where: { phone } });
    if (checkUserWithPhone) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "User with this phone already exists"
      );
    }
    // step: create user
    const user = await UserModel.create({
      fullName,
      email,
      phone,
      password,
    });
    if (!user) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "User did not created"
      );
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user.get("id"), userType: type },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: user.get("id"), userType: type },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      }
    );
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "User created successfully",
      data: { accessToken, refreshToken },
    });
  };

  // ============================ login ============================
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type, phone }: loginDTO = req.body;
    let UserModel: any;
    if (type == RegisterEnum.ADMIN) {
      UserModel = Admin;
    } else if (type == RegisterEnum.CUSTOMER) {
      UserModel = Customer;
    } else if (type == RegisterEnum.CAFE) {
      UserModel = Cafe;
    } else if (type == RegisterEnum.RESTAURENT) {
      UserModel = Restaurant;
    }
    // step: check user
    const user = await UserModel.findOne({ where: { phone } });
    if (!user) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user.get("id"), userType: type },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: user.get("id"), userType: type },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      }
    );
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      message: "Loggedin successfully",
      data: { accessToken, refreshToken },
    });
  };

  // ============================ refreshToken ============================
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const authorization = req.headers.authorization;
    // step: check authorization
    if (!authorization) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Authorization undefiend");
    }
    // step: decode authorization
    const { user, payload } = await decodeToken({
      authorization,
      tokenType: TokenTypesEnum.refresh,
    });
    // step: create accessToken
    const newPayload = {
      userId: payload.userId,
      userType: payload.userType,
    };
    const jwtid = createOtp();
    const accessToken = createJwt(
      newPayload,
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid,
      }
    );
    return responseHandler({ res, data: { accessToken } });
  };

  // ============================ profile ============================
  profile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      data: { user },
    });
  };

  // ============================ getFile ============================
  getFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const path = req.params.path as unknown as string[];
    const Key = path.join("/");
    const url = await createPresignedUrlToGetFileS3({ Key });
    return responseHandler({
      res,
      message: "File URL generated successfully",
      data: { url },
    });
  };

  // ============================ deleteFile ============================
  deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    const path = req.params.path as unknown as string[];
    const Key = path.join("/");
    const result = await deleteFileS3({ Key });
    return responseHandler({
      res,
      message: "File deleted successfully",
    });
  };

  // ============================ deleteMultiFiles ============================
  deleteMultiFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { Keys, Quiet = false }: deleteMultiFilesDTO = req.body;
    const result = await deleteMultiFilesS3({ Keys, Quiet });
    return responseHandler({
      res,
      message: "Files deleted successfully",
    });
  };

  // ============================ logout ============================
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type }: logoutDTO = req.body;
    let UserModel: any;
    if (type == RegisterEnum.ADMIN) {
      UserModel = Admin;
    } else if (type == RegisterEnum.CUSTOMER) {
      UserModel = Customer;
    } else if (type == RegisterEnum.CAFE) {
      UserModel = Cafe;
    } else if (type == RegisterEnum.RESTAURENT) {
      UserModel = Restaurant;
    }
    const user = res.locals.user;
    // step: change credentialsChangedAt
    const updatedUser = await UserModel.update(
      { credentialsChangedAt: new Date(Date.now()) },
      { where: { id: user.id } }
    );
    return responseHandler({
      res,
      message: "Logged out successfully",
    });
  };
}
