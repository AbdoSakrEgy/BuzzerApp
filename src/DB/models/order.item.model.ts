import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Order } from "./order.model";
import { Product } from "./product.model";

export const OrderItem = sequelize.define(
  "order_items",
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // optional if product is deleted later
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// Associations
OrderItem.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(OrderItem, { foreignKey: "order_id" });

OrderItem.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });
