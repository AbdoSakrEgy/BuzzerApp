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
import {
  addCategoryDTO,
  deleteAccountDTO,
  deleteCategoryDTO,
  getCategoryDTO,
  updateBasicInfoDTO,
  updateCategoryDTO,
} from "./admin.dto";
import { Admin } from "../../DB/models/admin.model";
import { IAdminService } from "../../types/modules.interfaces";
import { RegisterEnum } from "../../types/global.types";
import { Category } from "../../DB/models/category.model";

export class AdminService implements IAdminService {
  constructor() {}

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
      dest: `admins/${user.id}/profileImage`,
      fileFromMulter: req.file as Express.Multer.File,
    });
    // step: update user
    await Admin.update({ profileImage: Key }, { where: { id: user.id } });
    return responseHandler({
      res,
      message: "Profile image uploaded successfully",
      data: { Key },
    });
  };

  // ============================ updateBasicInfo ============================
  updateBasicInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { fullName, age, gender, email }: updateBasicInfoDTO = req.body;
    // step: check email validation
    if (email) {
      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin && existingAdmin.get("id") !== user.id) {
        throw new AppError(HttpStatusCode.BAD_REQUEST, "Email already exists");
      }
    }
    // step: update basic info
    const updatedAdmin = await Admin.update(
      { fullName, age, gender },
      { where: { id: user.id } }
    );
    if (!updatedAdmin) {
      return responseHandler({
        res,
        message: "Error while update admin",
        status: 500,
      });
    }
    return responseHandler({
      res,
      message: "Admin updated successfully",
      data: { admin: updatedAdmin },
    });
  };

  // ============================ addCategory ============================
  addCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { name, description }: addCategoryDTO = req.body;
    // step: add category
    const category = await Category.create({ name, description });
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Category created successfully",
      data: { category },
    });
  };

  // ============================ getCategory ============================
  getCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { name }: getCategoryDTO = req.body;
    // step: add category
    const category = await Category.findOne({ where: { name } });
    return responseHandler({
      res,
      status: HttpStatusCode.OK,
      data: { category },
    });
  };

  // ============================ updateCategory ============================
  updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { id, name, description }: updateCategoryDTO = req.body;
    // step: add category
    const category = await Category.update(
      { name, description },
      { where: { id } }
    );
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Category updated successfully",
      data: { category },
    });
  };

  // ============================ deleteCategory ============================
  deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { id }: deleteCategoryDTO = req.body;
    // step: add category
    const category = await Category.destroy({ where: { id } });
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Category deleted successfully",
      data: { category },
    });
  };
}
