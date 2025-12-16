"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const cart_model_1 = require("./cart.model");
const product_model_1 = require("./product.model");
exports.CartItem = db_connection_1.sequelize.define("cart_items", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: cart_model_1.Cart,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: product_model_1.Product,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            min: 1,
        },
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Associations
exports.CartItem.belongsTo(cart_model_1.Cart, { foreignKey: "cart_id" });
cart_model_1.Cart.hasMany(exports.CartItem, { foreignKey: "cart_id" });
exports.CartItem.belongsTo(product_model_1.Product, { foreignKey: "product_id" });
product_model_1.Product.hasMany(exports.CartItem, { foreignKey: "product_id" });
