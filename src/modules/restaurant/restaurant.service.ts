import { Restaurant } from "./../../DB/models/restaurant.model";
import { NextFunction, Request, Response } from "express";
import {
  createPresignedUrlToGetFileS3,
  uploadSingleSmallFileS3,
} from "../../utils/S3-AWS/S3.services";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { responseHandler } from "../../core/handlers/response.handler";
import { uploadProfileImageSchema } from "./restaurant.validation";
import { updateBasicInfoDTO } from "./restaurant.dto";
import { IRestaurantService } from "../../types/modules.interfaces";

export class RestaurantService implements IRestaurantService {
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
      dest: `restaurants/${user.id}/profileImage`,
      fileFromMulter: req.file as Express.Multer.File,
    });
    // step: update user
    const url = await createPresignedUrlToGetFileS3({ Key });
    await Restaurant.update(
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
      const checkRestaurant = await Restaurant.findOne({ where: { email } });
      if (checkRestaurant && checkRestaurant.get("id") !== user.id) {
        throw new AppError(HttpStatusCode.BAD_REQUEST, "Email already exists");
      }
    }
    // step: update basic info
    const updatedRestaurant = await Restaurant.update(
      { fullName, age, gender },
      { where: { id: user.id } }
    );
    if (!updatedRestaurant) {
      return responseHandler({
        res,
        message: "Error while update restaurant",
        status: 500,
      });
    }
    return responseHandler({
      res,
      message: "Restaurant updated successfully",
      data: { restaurant: updatedRestaurant },
    });
  };

  // ============================ allRestaurants ============================
  allRestaurants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const restaurants = await Restaurant.findAll();
    return responseHandler({
      res,
      data: { restaurants },
    });
  };
}
