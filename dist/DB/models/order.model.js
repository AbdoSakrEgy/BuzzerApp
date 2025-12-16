"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const customer_model_1 = require("./customer.model");
const payment_model_1 = require("./payment.model");
exports.Order = db_connection_1.sequelize.define("orders", {
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
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "paid", "cancelled", "refunded"),
        defaultValue: "pending",
    },
    payment_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: payment_model_1.Payment,
            key: "id",
        },
        onDelete: "SET NULL",
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Associations
exports.Order.belongsTo(customer_model_1.Customer, { foreignKey: "customer_id" });
customer_model_1.Customer.hasMany(exports.Order, { foreignKey: "customer_id" });
exports.Order.belongsTo(payment_model_1.Payment, { foreignKey: "payment_id" });
payment_model_1.Payment.hasOne(exports.Order, { foreignKey: "payment_id" });
