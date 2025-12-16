import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Customer } from "./customer.model";
import { Payment } from "./payment.model";

export const Order = sequelize.define(
  "orders",
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
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled", "refunded"),
      defaultValue: "pending",
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Payment,
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// Associations
Order.belongsTo(Customer, { foreignKey: "customer_id" });
Customer.hasMany(Order, { foreignKey: "customer_id" });

Order.belongsTo(Payment, { foreignKey: "payment_id" });
Payment.hasOne(Order, { foreignKey: "payment_id" });
