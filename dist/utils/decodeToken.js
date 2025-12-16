"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.TokenTypesEnum = void 0;
const user_model_js_1 = require("../modules/user/user.model.js");
const jwt_js_1 = require("./jwt.js");
const app_error_js_1 = require("../core/errors/app.error.js");
const http_status_code_js_1 = require("../core/http/http.status.code.js");
var TokenTypesEnum;
(function (TokenTypesEnum) {
    TokenTypesEnum["access"] = "access";
    TokenTypesEnum["refresh"] = "refresh";
})(TokenTypesEnum || (exports.TokenTypesEnum = TokenTypesEnum = {}));
const userModel = user_model_js_1.UserModel;
const decodeToken = async ({ authorization, tokenType = TokenTypesEnum.access, }) => {
    // step: bearer key
    if (!authorization.startsWith(process.env.BEARER_KEY)) {
        throw new app_error_js_1.AppError(http_status_code_js_1.HttpStatusCode.BAD_REQUEST, "Invalid bearer key");
    }
    // step: token validation
    let [bearer, token] = authorization.split(" ");
    // step: check authorization existence
    if (!token || token == null) {
        throw new app_error_js_1.AppError(http_status_code_js_1.HttpStatusCode.BAD_REQUEST, "Invalid authorization");
    }
    let privateKey = "";
    if (tokenType == TokenTypesEnum.access) {
        privateKey = process.env.ACCESS_SEGNATURE;
    }
    else if (tokenType == TokenTypesEnum.refresh) {
        privateKey = process.env.REFRESH_SEGNATURE;
    }
    let payload = (0, jwt_js_1.verifyJwt)({ token, privateKey }); // result || error
    // step: user existence
    const user = await userModel.findOne({ _id: payload.userId });
    if (!user) {
        throw new app_error_js_1.AppError(http_status_code_js_1.HttpStatusCode.NOT_FOUND, "User not found");
    }
    // step: credentials changing
    if (user.credentialsChangedAt) {
        if (user.credentialsChangedAt.getTime() > payload.iat * 1000) {
            throw new app_error_js_1.AppError(http_status_code_js_1.HttpStatusCode.BAD_REQUEST, "You have to login");
        }
    }
    // step: return user & payload
    return { user, payload };
};
exports.decodeToken = decodeToken;
