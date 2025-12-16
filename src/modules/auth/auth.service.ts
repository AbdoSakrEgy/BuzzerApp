import { NextFunction, Request, Response } from "express";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { responseHandler } from "../../core/handlers/response.handler";
import { IAdminService } from "../../types/admin.module.type";
import {
  logincheckOtpDTO,
  loginDTO,
  logoutDTO,
  registerCheckOtpDTO,
  registerDTO,
} from "./auth.dto";
import { createJwt } from "../../utils/jwt";
import { createOtp } from "../../utils/createOtp";
import { RegisterEnum } from "../../types/auth.module.type";
import { Admin } from "../../DB/models/admin.model";
import { decodeToken, TokenTypesEnum } from "../../utils/decodeToken";
import { createPresignedUrlToGetFileS3 } from "../../utils/S3-AWS/S3.services";

export class AdminService implements IAdminService {
  constructor() {}

  // ============================ register ============================
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { phone }: registerDTO = req.body;
    // step: check admin existence
    const checkAdmin = await Admin.findOne({ where: { phone } });
    if (checkAdmin) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Admin already exist");
    }
    // step: send otp from firebase
    // ????????????????????
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      message: `Otp sended to ${phone}`,
      data: {},
    });
  };

  // ============================ login ============================
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { phone }: loginDTO = req.body;
    // step: check admin existence
    const checkAdmin = await Admin.findOne({ where: { phone } });
    if (!checkAdmin) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Admin not found");
    }
    // step: send otp from firebase
    // ????????????????????
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      message: `Otp sended to ${phone}`,
      data: {},
    });
  };

  // ============================ registerCheckOtp ============================
  registerCheckOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type, fullName, email, phone, password, otp }: registerCheckOtpDTO =
      req.body;
    let UserModel: any;
    if (type == RegisterEnum.ADMIN) {
      UserModel = Admin;
    } else if (type == RegisterEnum.CUSTOMER) {
    } else if (type == RegisterEnum.CAFE) {
    } else if (type == RegisterEnum.RESTAURENT) {
    }
    // step: check otp from firebase
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (false) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid OTP");
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

  // ============================ loginCheckOtp ============================
  loginCheckOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type, phone, otp }: logincheckOtpDTO = req.body;
    let UserModel: any;
    if (type == RegisterEnum.ADMIN) {
      UserModel = Admin;
    } else if (type == RegisterEnum.CUSTOMER) {
    } else if (type == RegisterEnum.CAFE) {
    } else if (type == RegisterEnum.RESTAURENT) {
    }
    // step: check otp from firebase
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (false) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid OTP");
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
    } else if (type == RegisterEnum.CAFE) {
    } else if (type == RegisterEnum.RESTAURENT) {
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
