import { sequelize } from "../../DB/db.connection";
import { DataTypes, Model, Optional } from "sequelize";

// Define the attributes interface
export interface CouponAttributes {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

// Define creation attributes (id is optional since it's auto-generated)
export interface CouponCreationAttributes
  extends Optional<CouponAttributes, "id" | "usedCount" | "isActive"> {}

// Define the Coupon model class
export class Coupon
  extends Model<CouponAttributes, CouponCreationAttributes>
  implements CouponAttributes
{
  declare id: number;
  declare code: string;
  declare discountType: "percentage" | "fixed";
  declare discountValue: number;
  declare maxDiscount: number | null;
  declare minOrderAmount: number | null;
  declare expiresAt: Date | null;
  declare usageLimit: number | null;
  declare usedCount: number;
  declare isActive: boolean;
}

Coupon.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discountType: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 0 },
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "coupons",
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);
