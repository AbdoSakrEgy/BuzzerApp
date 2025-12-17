"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCoupon = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const order_model_1 = require("./order.model");
const coupon_model_1 = require("./coupon.model");
exports.OrderCoupon = db_connection_1.sequelize.define("order_coupons", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: order_model_1.Order,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    coupon_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: coupon_model_1.Coupon,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    discountAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Associations
exports.OrderCoupon.belongsTo(order_model_1.Order, { foreignKey: "order_id" });
order_model_1.Order.hasMany(exports.OrderCoupon, { foreignKey: "order_id" });
exports.OrderCoupon.belongsTo(coupon_model_1.Coupon, { foreignKey: "coupon_id" });
coupon_model_1.Coupon.hasMany(exports.OrderCoupon, { foreignKey: "coupon_id" });
