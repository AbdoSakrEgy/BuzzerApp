import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Customer } from "./customer.model";

export const Address = sequelize.define(
  "addresses",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Customer, key: "id" },
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Home, Work, etc.",
    },
    city: { type: DataTypes.STRING, allowNull: false },
    area: { type: DataTypes.STRING, allowNull: true },
    street: { type: DataTypes.STRING, allowNull: true },
    building: { type: DataTypes.STRING, allowNull: true },
    floor: { type: DataTypes.STRING, allowNull: true },
    apartment: { type: DataTypes.STRING, allowNull: true },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// Define the association
Customer.hasMany(Address, { foreignKey: "customer_id", as: "addresses" });
Address.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
