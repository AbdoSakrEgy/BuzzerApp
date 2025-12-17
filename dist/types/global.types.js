"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatusEnum = exports.RegisterEnum = exports.GenderEnum = exports.PaymentStatusEnum = exports.PricingPlanEnum = void 0;
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
var RegisterEnum;
(function (RegisterEnum) {
    RegisterEnum["ADMIN"] = "admin";
    RegisterEnum["CUSTOMER"] = "customer";
    RegisterEnum["CAFE"] = "cafe";
    RegisterEnum["RESTAURENT"] = "restaurent";
})(RegisterEnum || (exports.RegisterEnum = RegisterEnum = {}));
var OrderStatusEnum;
(function (OrderStatusEnum) {
    OrderStatusEnum["PENDING"] = "pending";
    OrderStatusEnum["PROCESSING"] = "processing";
    OrderStatusEnum["SHIPPED"] = "shipped";
    OrderStatusEnum["DELIVERED"] = "delivered";
    OrderStatusEnum["CANCELLED"] = "cancelled";
    OrderStatusEnum["REFUNDED"] = "refunded";
})(OrderStatusEnum || (exports.OrderStatusEnum = OrderStatusEnum = {}));
