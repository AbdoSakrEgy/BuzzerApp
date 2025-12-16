import { NextFunction, Request, Response } from "express";
import {
  uploadSingleSmallFileS3,
  createPresignedUrlToGetFileS3,
  deleteFileS3,
  deleteMultiFilesS3,
} from "../../utils/S3-AWS/S3.services";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { responseHandler } from "../../core/handlers/response.handler";
import { uploadProfileImageSchema } from "./admin.validation";
import { IAdminService } from "../../types/admin.module.type";
import {
  deleteAccountDTO,
  logincheckOtpDTO,
  loginDTO,
  registerCheckOtpDTO,
  registerDTO,
} from "./admin.dto";
import { createJwt } from "../../utils/jwt";
import { createOtp } from "../../utils/createOtp";
import { RegisterEnum } from "../../types/auth.module.type";
import { Admin } from "../../DB/models/admin.model";
import { decodeToken, TokenTypesEnum } from "../../utils/decodeToken";

export class AdminService implements IAdminService {
  constructor() {}

  // ============================ register ============================
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type, fullName, email, phone, password }: registerDTO = req.body;
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
    // step: check otp from firebase
    // ????????????????????
    if (false) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid OTP");
    }
    // step: create admin
    const admin = await Admin.create({
      type,
      fullName,
      email,
      phone,
      password,
    });
    if (!admin) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Creation failed"
      );
    }
    // step: create token
    const accessToken = createJwt(
      { userId: admin.get("id"), userType: RegisterEnum.ADMIN },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: admin.get("id"), userType: RegisterEnum.ADMIN },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      }
    );
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Admin created successfully",
      data: { accessToken, refreshToken },
    });
  };

  // ============================ loginCheckOtp ============================
  loginCheckOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { phone, otp }: logincheckOtpDTO = req.body;
    // step: check otp from firebase
    // ????????????????????
    if (false) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid OTP");
    }
    // step: check admin
    const admin = await Admin.findOne({ where: { phone } });
    if (!admin) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Admin not found");
    }
    // step: create token
    const accessToken = createJwt(
      { userId: admin.get("id"), usrType: RegisterEnum.ADMIN },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: admin.get("id"), usrType: RegisterEnum.ADMIN },
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

  // ============================ deleteAccount ============================
  deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { accountId, accountType }: deleteAccountDTO = req.body;
    // step: check account existence
    if (accountType == RegisterEnum.ADMIN) {
      await Admin.destroy({ where: { id: accountId } });
    } else if (accountType == RegisterEnum.CUSTOMER) {
    } else if (accountType == RegisterEnum.CAFE) {
    } else if (accountType == RegisterEnum.RESTAURENT) {
    }
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      message: "Account deleted successfully",
      data: {},
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
    // const jwtid = "666";
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

  //! ============================ profile ============================
  profile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      message: "Account deleted successfully",
      data: {},
    });
  };

  // //! ============================ uploadProfileImage ============================
  // uploadProfileImage = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response> => {
  //   const user = res.locals.user;
  //   // step: validate multipart/form-data req
  //   const parsed = uploadProfileImageSchema.safeParse({
  //     ...req.body,
  //     profileImage: req.file,
  //   });
  //   if (!parsed.success) {
  //     const errors = parsed.error.issues
  //       .map((e) => `${e.path.join(".")}: ${e.message}`)
  //       .join("; ");
  //     throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
  //   }
  //   // step: upload image
  //   const Key = await uploadSingleSmallFileS3({
  //     dest: `users/${user._id}/profileImage`,
  //     fileFromMulter: req.file as Express.Multer.File,
  //   });
  //   // step: update user
  //   const updatedUser = await UserModel.findOneAndUpdate(
  //     { _id: user._id },
  //     { $set: { profileImage: Key } }
  //   );
  //   return responseHandler({
  //     res,
  //     message: "Profile image uploaded successfully",
  //     data: { Key },
  //   });
  // };

  // //! ============================ getFile ============================
  // getFile = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response> => {
  //   const path = req.params.path as unknown as string[];
  //   const Key = path.join("/");
  //   const url = await createPresignedUrlToGetFileS3({ Key });
  //   return responseHandler({
  //     res,
  //     message: "File URL generated successfully",
  //     data: { url },
  //   });
  // };

  // //! ============================ deleteFile ============================
  // deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  //   const path = req.params.path as unknown as string[];
  //   const Key = path.join("/");
  //   const result = await deleteFileS3({ Key });
  //   return responseHandler({
  //     res,
  //     message: "File deleted successfully",
  //   });
  // };

  // //! ============================ deleteMultiFiles ============================
  // deleteMultiFiles = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   const { Keys, Quiet = false }: deleteMultiFilesDTO = req.body;
  //   const result = await deleteMultiFilesS3({ Keys, Quiet });
  //   return responseHandler({
  //     res,
  //     message: "Files deleted successfully",
  //   });
  // };

  // //! ============================ updateBasicInfo ============================
  // updateBasicInfo = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<Response> => {
  //   const user = res.locals.user;
  //   const { firstName, lastName, age, gender, phone }: updateBasicInfoDTO =
  //     req.body;
  //   // step: update basic info
  //   const updatedUser = await UserModel.findOneAndUpdate(
  //     { _id: user._id },
  //     { $set: { firstName, lastName, age, gender, phone } },
  //     { new: true }
  //   );
  //   if (!updatedUser) {
  //     return responseHandler({
  //       res,
  //       message: "Error while update user",
  //       status: 500,
  //     });
  //   }
  //   return responseHandler({
  //     res,
  //     message: "User updated successfully",
  //     data: { user: updatedUser },
  //   });
  // };
}
