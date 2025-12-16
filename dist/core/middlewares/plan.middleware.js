"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plan = void 0;
const user_model_1 = require("../../modules/user/user.model");
const user_module_type_1 = require("../../types/user.module.type");
const app_error_1 = require("../errors/app.error");
const http_status_code_1 = require("../http/http.status.code");
const plan = (allowedPlans, creditCost = 0) => {
    return async (req, res, next) => {
        const user = res.locals.user;
        // step: make low plans allowed to top plans
        if (allowedPlans.includes(user_module_type_1.PricingPlanEnum.FREE)) {
            allowedPlans.push(user_module_type_1.PricingPlanEnum.BASIC);
            allowedPlans.push(user_module_type_1.PricingPlanEnum.PRO);
        }
        if (allowedPlans.includes(user_module_type_1.PricingPlanEnum.BASIC)) {
            allowedPlans.push(user_module_type_1.PricingPlanEnum.PRO);
        }
        // step: check user plan
        const userPricingPlan = user.pricingPlan;
        if (!allowedPlans.includes(userPricingPlan)) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.FORBIDDEN, "Please upgrade your plan to access this API");
        }
        // step: check credits cost
        const userAvaliableCredits = user.avaliableCredits;
        if (creditCost > userAvaliableCredits) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Your credit not enough to access this API");
        }
        // step: calculate new credits
        const newAvaliableCredits = userAvaliableCredits - creditCost;
        const updatedUser = await user_model_1.UserModel.findOneAndUpdate({ _id: user._id }, { $set: { avaliableCredits: newAvaliableCredits } });
        next();
    };
};
exports.plan = plan;
