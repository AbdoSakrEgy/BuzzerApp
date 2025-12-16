"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const category_model_1 = require("./category.model");
const cafe_model_1 = require("./cafe.model");
const restaurant_model_1 = require("./restaurant.model");
exports.Product = db_connection_1.sequelize.define("products", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: category_model_1.Category, key: "id" },
        onDelete: "CASCADE",
    },
    cafe_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: cafe_model_1.Cafe, key: "id" },
        onDelete: "SET NULL",
    },
    restaurant_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: restaurant_model_1.Restaurant, key: "id" },
        onDelete: "SET NULL",
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            checkNameLength(value) {
                if (value.length <= 2) {
                    throw new Error("Product name should be more than 2 characters.");
                }
            },
        },
    },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    isAvailable: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    availableQuantity: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
    },
    images: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        // Array of { public_id: string, secure_url: string }
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
exports.Product.belongsTo(category_model_1.Category, { foreignKey: "category_id" });
exports.Product.belongsTo(cafe_model_1.Cafe, { foreignKey: "cafe_id" });
exports.Product.belongsTo(restaurant_model_1.Restaurant, { foreignKey: "restaurant_id" });
