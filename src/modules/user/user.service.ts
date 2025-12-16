import { NextFunction, Request, Response } from "express";
import {
  deleteMultiFilesDTO,
  updateBasicInfoDTO,
  uploadAvatarImageDTO,
} from "./user.dto";
import {
  createPreSignedUrlToUploadFileS3,
  uploadMultiFilesS3,
  uploadSingleSmallFileS3,
  uploadSingleLargeFileS3,
  getFileS3,
  createPresignedUrlToGetFileS3,
  deleteFileS3,
  deleteMultiFilesS3,
} from "../../utils/S3-AWS/S3.services";
import { StoreInEnum } from "../../types/multer.type";
import { promisify } from "util";
import { pipeline } from "stream";
import { IUser, IUserService } from "../../types/user.module.type";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { UserModel } from "./user.model";
import { responseHandler } from "../../core/handlers/response.handler";
import {
  uploadCoverImagesSchema,
  uploadProfileImageSchema,
  uploadProfileVideoSchema,
} from "./user.validation";

export class UserService implements IUserService {
  constructor() {}

  // ============================ userProfile ============================
  userProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    let user = res.locals.user;
    let userId = req.params?.userId;
    // step: if userId existence
    if (userId) {
      user = await UserModel.findOne({ _id: userId });
    }
    userId = user._id;
    return responseHandler({ res, data: { user } });
  };

  // ============================ uploadProfileImage ============================
  uploadProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate multipart/form-data req
    const parsed = uploadProfileImageSchema.safeParse({
      ...req.body,
      profileImage: req.file,
    });
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    // step: upload image
    const Key = await uploadSingleSmallFileS3({
      dest: `users/${user._id}/profileImage`,
      fileFromMulter: req.file as Express.Multer.File,
    });
    // step: update user
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { profileImage: Key } }
    );
    return responseHandler({
      res,
      message: "Profile image uploaded successfully",
      data: { Key },
    });
  };

  // ============================ uploadProfileVideo ============================
  uploadProfileVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate multipart/form-data req
    const parsed = uploadProfileVideoSchema.safeParse({
      ...req.body,
      profileVideo: req.file,
    });
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    // step: upload video
    const Key = await uploadSingleLargeFileS3({
      dest: `users/${user._id}/profileVideo`,
      fileFromMulter: req.file as Express.Multer.File,
      storeIn: StoreInEnum.DISK,
    });
    // step: update user
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { profileVideo: Key } }
    );
    return responseHandler({
      res,
      message: "Profile video uploaded successfully",
      data: { Key },
    });
  };

  // ============================ uploadAvatarImage ============================
  uploadAvatarImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { fileName, fileType }: uploadAvatarImageDTO = req.body;
    // step: upload image
    const { url, Key } = await createPreSignedUrlToUploadFileS3({
      dest: `users/${user._id}/avatarImage`,
      fileName,
      ContentType: fileType,
    });
    // step: update user
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { avatarImage: Key } }
    );
    return responseHandler({
      res,
      message:
        "Use url to upload your image by using it as API with PUT method",
      data: { url, Key },
    });
  };

  // ============================ uploadCoverImages ============================
  uploadCoverImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: validate multipart/form-data req
    const parsed = uploadCoverImagesSchema.safeParse({
      ...req.body,
      coverImages: req.files,
    });
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    // step: upload images
    const Keys = await uploadMultiFilesS3({
      filesFromMulter: req.files as Express.Multer.File[],
      dest: `users/${user._id}/coverImages`,
    });
    // step: update user
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { coverImages: Keys } }
    );
    return responseHandler({
      res,
      message: "Cover images uploaded successfully",
      data: { Keys },
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

  // ============================ updateBasicInfo ============================
  updateBasicInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { firstName, lastName, age, gender, phone }: updateBasicInfoDTO =
      req.body;
    // step: update basic info
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { firstName, lastName, age, gender, phone } },
      { new: true }
    );
    if (!updatedUser) {
      return responseHandler({
        res,
        message: "Error while update user",
        status: 500,
      });
    }
    return responseHandler({
      res,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  };
}
