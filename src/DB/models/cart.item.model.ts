import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Cart } from "./cart.model";
import { Product } from "./product.model";

export const CartItem = sequelize.define(
  "cart_items",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cart,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// Associations
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
Cart.hasMany(CartItem, { foreignKey: "cart_id" });

CartItem.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(CartItem, { foreignKey: "product_id" });
