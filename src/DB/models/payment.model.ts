import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Customer } from "./customer.model";
import { PaymentStatusEnum } from "../../types/global.types";

export const Payment = sequelize.define(
  "payments",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    checkoutSessionId: { type: DataTypes.STRING, allowNull: true },
    paymentIntentId: { type: DataTypes.STRING, allowNull: true },
    refundId: { type: DataTypes.STRING, allowNull: true },
    refundedAt: { type: DataTypes.DATE, allowNull: true },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM(
        PaymentStatusEnum.PENDING,
        PaymentStatusEnum.COMPLETED,
        PaymentStatusEnum.REFUNDED
      ),
      defaultValue: PaymentStatusEnum.PENDING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    paranoid: false,
  }
);

// Associations
Payment.belongsTo(Customer, { foreignKey: "customer_id" });
Customer.hasMany(Payment, { foreignKey: "customer_id" });
