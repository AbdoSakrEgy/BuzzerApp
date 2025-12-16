"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const customer_model_1 = require("./customer.model");
const global_types_1 = require("../../types/global.types");
exports.Payment = db_connection_1.sequelize.define("payments", {
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
    checkoutSessionId: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    paymentIntentId: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    refundId: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    refundedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(global_types_1.PaymentStatusEnum.PENDING, global_types_1.PaymentStatusEnum.COMPLETED, global_types_1.PaymentStatusEnum.REFUNDED),
        defaultValue: global_types_1.PaymentStatusEnum.PENDING,
    },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Associations
exports.Payment.belongsTo(customer_model_1.Customer, { foreignKey: "customer_id" });
customer_model_1.Customer.hasMany(exports.Payment, { foreignKey: "customer_id" });
