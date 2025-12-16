"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const customer_model_1 = require("./customer.model");
exports.Cart = db_connection_1.sequelize.define("carts", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: customer_model_1.Customer,
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Association
exports.Cart.belongsTo(customer_model_1.Customer, { foreignKey: "customer_id" });
customer_model_1.Customer.hasOne(exports.Cart, { foreignKey: "customer_id" });
