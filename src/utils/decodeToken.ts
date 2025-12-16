import { MyJwtPayload, verifyJwt } from "./jwt.js";
import { AppError } from "../core/errors/app.error.js";
import { HttpStatusCode } from "../core/http/http.status.code.js";
import { RegisterEnum } from "../types/auth.module.type.js";
import { Admin } from "../DB/models/admin.model.js";
import { Customer } from "../DB/models/customer.model.js";
import { Cafe } from "../DB/models/cafe.model.js";
import { Restaurant } from "../DB/models/restaurant.model.js";

export enum TokenTypesEnum {
  access = "access",
  refresh = "refresh",
}

export const decodeToken = async ({
  authorization,
  tokenType = TokenTypesEnum.access,
}: {
  authorization: string;
  tokenType?: TokenTypesEnum;
}): Promise<{ user: any; payload: MyJwtPayload }> => {
  // step: bearer key
  if (!authorization.startsWith(process.env.BEARER_KEY as string)) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid bearer key");
  }
  // step: token validation
  let [bearer, token] = authorization.split(" ");
  // step: check authorization existence
  if (!token || token == null) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid authorization");
  }
  let privateKey = "";
  if (tokenType == TokenTypesEnum.access) {
    privateKey = process.env.ACCESS_SEGNATURE as string;
  } else if (tokenType == TokenTypesEnum.refresh) {
    privateKey = process.env.REFRESH_SEGNATURE as string;
  }
  let payload = verifyJwt({ token, privateKey }); // result || error
  // step: check user existence
  let user: any;
  if (payload.userType == RegisterEnum.ADMIN) {
    user = await Admin.findOne({ where: { id: payload.userId } });
  } else if (payload.userType == RegisterEnum.CUSTOMER) {
    user = await Customer.findOne({ where: { id: payload.userId } });
  } else if (payload.userType == RegisterEnum.CAFE) {
    user = await Cafe.findOne({ where: { id: payload.userId } });
  } else if (payload.userType == RegisterEnum.RESTAURENT) {
    user = await Restaurant.findOne({ where: { id: payload.userId } });
  }
  // step: user existence
  if (!user) {
    throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
  }
  // step: credentials changing
  if (user.credentialsChangedAt) {
    if (user.credentialsChangedAt.getTime() > payload.iat * 1000) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "You have to login");
    }
  }
  // step: return user & payload
  return { user, payload };
};
