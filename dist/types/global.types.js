"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenderEnum = exports.PaymentStatusEnum = exports.PricingPlanEnum = void 0;
var PricingPlanEnum;
(function (PricingPlanEnum) {
    PricingPlanEnum["FREE"] = "free";
    PricingPlanEnum["BASIC"] = "basic";
    PricingPlanEnum["PRO"] = "PRO";
})(PricingPlanEnum || (exports.PricingPlanEnum = PricingPlanEnum = {}));
var PaymentStatusEnum;
(function (PaymentStatusEnum) {
    PaymentStatusEnum["PENDING"] = "pending";
    PaymentStatusEnum["COMPLETED"] = "completed";
    PaymentStatusEnum["REFUNDED"] = "refunded";
})(PaymentStatusEnum || (exports.PaymentStatusEnum = PaymentStatusEnum = {}));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "male";
    GenderEnum["FEMALE"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
