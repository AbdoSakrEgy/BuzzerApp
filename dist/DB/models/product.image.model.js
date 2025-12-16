"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImage = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const product_model_1 = require("./product.model");
exports.ProductImage = db_connection_1.sequelize.define("product_images", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: product_model_1.Product,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    imageKey: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    imageOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Associations
exports.ProductImage.belongsTo(product_model_1.Product, { foreignKey: "product_id" });
product_model_1.Product.hasMany(exports.ProductImage, { foreignKey: "product_id", as: "images" });
