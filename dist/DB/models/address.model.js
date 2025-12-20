"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
const global_types_1 = require("../../types/global.types");
exports.Address = db_connection_1.sequelize.define("addresses", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        // No foreign key - polymorphic relationship (can be admin, customer, cafe, or restaurant)
    },
    user_type: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(global_types_1.RegisterEnum)),
        allowNull: false,
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
// No associations defined - polymorphic relationship managed by user_id + user_type
