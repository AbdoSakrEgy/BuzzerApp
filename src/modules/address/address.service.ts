import { NextFunction, Request, Response } from "express";
import { responseHandler } from "../../core/handlers/response.handler";
import { IAddressService } from "../../types/modules.interfaces";
import { AppError } from "../../core/errors/app.error";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { Address } from "../../DB/models/address.model";
import { addAddressSchema, updateAddressSchema } from "./address.validation";
import { addAddressDTO, updateAddressDTO } from "./address.dto";

export class AddressService implements IAddressService {
  constructor() {}

  // ============================ addAddress ============================
  addAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { userId, userType } = res.locals.payload;
    // step: validate request body
    const parsed = addAddressSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const {
      label,
      city,
      area,
      street,
      building,
      floor,
      apartment,
      isDefault,
    }: addAddressDTO = parsed.data;
    // step: if isDefault is true, set all other addresses to not default
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { user_id: userId, user_type: userType } }
      );
    }
    // step: create address
    const address = await Address.create({
      user_id: userId,
      user_type: userType,
      label,
      city,
      area,
      street,
      building,
      floor,
      apartment,
      isDefault,
    });
    return responseHandler({
      res,
      status: HttpStatusCode.CREATED,
      message: "Address created successfully",
      data: { address },
    });
  };

  // ============================ getAddress ============================
  getAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;
    const address = await Address.findOne({
      where: { id },
    });
    if (!address) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Address not found");
    }
    return responseHandler({
      res,
      message: "Address retrieved successfully",
      data: { address },
    });
  };

  // ============================ getAllAddresses ============================
  getAllAddresses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const addresses = await Address.findAll();
    return responseHandler({
      res,
      message: "Addresses retrieved successfully",
      data: { addresses },
    });
  };

  // ============================ updateAddress ============================
  updateAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { userId, userType } = res.locals.payload;
    // step: validate request body
    const parsed = updateAddressSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(HttpStatusCode.BAD_REQUEST, errors);
    }
    const {
      id,
      label,
      city,
      area,
      street,
      building,
      floor,
      apartment,
      isDefault,
    }: updateAddressDTO = parsed.data;
    // step: check if address exists and belongs to the user
    const address = await Address.findOne({
      where: { id, user_id: userId, user_type: userType },
    });
    if (!address) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Address not found");
    }
    // step: if isDefault is true, set all other addresses to not default
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { user_id: userId, user_type: userType } }
      );
    }
    // step: update address
    await Address.update(
      {
        label,
        city,
        area,
        street,
        building,
        floor,
        apartment,
        isDefault,
      },
      { where: { id } }
    );
    // step: get updated address
    const updatedAddress = await Address.findByPk(id);
    return responseHandler({
      res,
      message: "Address updated successfully",
      data: { address: updatedAddress },
    });
  };

  // ============================ deleteAddress ============================
  deleteAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { userId, userType } = res.locals.payload;
    const { id } = req.params;
    // step: check if address exists and belongs to the user
    const address = await Address.findOne({
      where: { id, user_id: userId, user_type: userType },
    });
    if (!address) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Address not found");
    }
    // step: delete address
    await Address.destroy({ where: { id } });
    return responseHandler({
      res,
      message: "Address deleted successfully",
      data: { deletedAddressId: id },
    });
  };

  // ============================ setDefaultAddress ============================
  setDefaultAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;
    // step: check if address exists and belongs to the user
    const address = await Address.findOne({
      where: { id },
    });
    if (!address) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Address not found");
    }
    // step: set all addresses to not default
    await Address.update({ isDefault: false }, { where: { id } });
    // step: set this address as default
    await Address.update({ isDefault: true }, { where: { id } });
    // step: get updated address
    const updatedAddress = await Address.findByPk(id);
    return responseHandler({
      res,
      message: "Default address set successfully",
      data: { address: updatedAddress },
    });
  };
}
