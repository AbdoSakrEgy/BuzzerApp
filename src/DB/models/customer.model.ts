import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { PricingPlanEnum } from "../../types/global.types";

export const Customer = sequelize.define(
  "customers",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkNameLength(value: any) {
          if (value.length <= 2) {
            throw new Error("Full name should be more than 2 characters.");
          }
        },
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 18,
        max: 200,
      },
    },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    isEmailConfirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkPasswordLength(value: any) {
          if (value.length <= 6) {
            throw new Error("Password should be more than 6 characters.");
          }
        },
      },
    },
    credentialsChangedAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    deletedBy: { type: DataTypes.INTEGER, allowNull: true },
    is2FAActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    profileImage_public_id: { type: DataTypes.STRING, allowNull: true },
    checkoutSessionId: { type: DataTypes.STRING, allowNull: true },
    paymentIntentId: { type: DataTypes.STRING, allowNull: true },
    refundId: { type: DataTypes.STRING, allowNull: true },
    refundedAt: { type: DataTypes.DATE, allowNull: true },
    pricingPlan: {
      type: DataTypes.ENUM(
        PricingPlanEnum.FREE,
        PricingPlanEnum.BASIC,
        PricingPlanEnum.PRO
      ),
      defaultValue: PricingPlanEnum.FREE,
    },
    availableCredits: { type: DataTypes.INTEGER, defaultValue: 50 },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);
