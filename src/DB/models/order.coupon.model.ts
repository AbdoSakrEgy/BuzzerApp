import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Order } from "./order.model";
import { Coupon } from "./coupon.model";

export const OrderCoupon = sequelize.define(
  "order_coupons",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Coupon,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// Associations
OrderCoupon.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(OrderCoupon, { foreignKey: "order_id" });

OrderCoupon.belongsTo(Coupon, { foreignKey: "coupon_id" });
Coupon.hasMany(OrderCoupon, { foreignKey: "coupon_id" });
