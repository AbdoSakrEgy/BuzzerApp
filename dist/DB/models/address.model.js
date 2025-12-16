"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const customer_model_1 = require("./customer.model");
exports.Address = db_connection_1.sequelize.define("addresses", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: customer_model_1.Customer, key: "id" },
    },
    label: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: "Home, Work, etc.",
    },
    city: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    area: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    street: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    building: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    floor: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    apartment: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    isDefault: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
// Define the association
customer_model_1.Customer.hasMany(exports.Address, { foreignKey: "customer_id", as: "addresses" });
exports.Address.belongsTo(customer_model_1.Customer, { foreignKey: "customer_id", as: "customer" });
