"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const order_model_1 = require("./order.model");
const product_model_1 = require("./product.model");
exports.OrderItem = db_connection_1.sequelize.define("order_items", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: order_model_1.Order,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // optional if product is deleted later
        references: {
            model: product_model_1.Product,
            key: "id",
        },
        onDelete: "SET NULL",
    },
    product_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    product_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Associations
exports.OrderItem.belongsTo(order_model_1.Order, { foreignKey: "order_id" });
order_model_1.Order.hasMany(exports.OrderItem, { foreignKey: "order_id" });
exports.OrderItem.belongsTo(product_model_1.Product, { foreignKey: "product_id" });
product_model_1.Product.hasMany(exports.OrderItem, { foreignKey: "product_id" });
