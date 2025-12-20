import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { Category } from "./category.model";
import { Cafe } from "./cafe.model";
import { Restaurant } from "./restaurant.model";

export const Product = sequelize.define(
  "products",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Category, key: "id" },
      onDelete: "CASCADE",
    },
    cafe_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Cafe, key: "id" },
      onDelete: "SET NULL",
    },
    restaurant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Restaurant, key: "id" },
      onDelete: "SET NULL",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkNameLength(value: any) {
          if (value.length <= 2) {
            throw new Error("Product name should be more than 2 characters.");
          }
        },
      },
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    availableQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      // Array of { public_id: string, secure_url: string }
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

Product.belongsTo(Category, { foreignKey: "category_id" });
Product.belongsTo(Cafe, { foreignKey: "cafe_id" });
Product.belongsTo(Restaurant, { foreignKey: "restaurant_id" });
