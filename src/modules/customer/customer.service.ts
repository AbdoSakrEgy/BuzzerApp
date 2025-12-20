import { NextFunction, Request, Response } from "express";
import {
  createPresignedUrlToGetFileS3,
  uploadSingleSmallFileS3,
} from "../../utils/S3-AWS/S3.services";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { responseHandler } from "../../core/handlers/response.handler";
import { uploadProfileImageSchema } from "./customer.validation";
import { updateBasicInfoDTO } from "./customer.dto";
import { Customer } from "../../DB/models/customer.model";
import { ICustomerService } from "../../types/modules.interfaces";

export class CustomerService implements ICustomerService {
  constructor() {}

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
      dest: `customer/${user.id}/profileImage`,
      fileFromMulter: req.file as Express.Multer.File,
    });
    // step: update user
    const url = await createPresignedUrlToGetFileS3({ Key });
    await Customer.update(
      { profileImage_public_id: Key },
      { where: { id: user.id } }
    );
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
      const checkCustomer = await Customer.findOne({ where: { email } });
      if (checkCustomer && checkCustomer.get("id") !== user.id) {
        throw new AppError(HttpStatusCode.BAD_REQUEST, "Email already exists");
      }
    }
    // step: update basic info
    const updatedCustomer = await Customer.update(
      { fullName, age, gender },
      { where: { id: user.id } }
    );
    if (!updatedCustomer) {
      return responseHandler({
        res,
        message: "Error while update customer",
        status: 500,
      });
    }
    return responseHandler({
      res,
      message: "Customer updated successfully",
      data: { Customer: updatedCustomer },
    });
  };
}
