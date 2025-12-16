import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Customer } from "./customer.model";

export const Cart = sequelize.define(
  "carts",
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
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// Association
Cart.belongsTo(Customer, { foreignKey: "customer_id" });
Customer.hasOne(Cart, { foreignKey: "customer_id" });
