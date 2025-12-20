"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cafe = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
exports.Cafe = db_connection_1.sequelize.define("cafes", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            checkNameLength(value) {
                if (value && value.length <= 2) {
                    throw new Error("Full name should be more than 2 characters.");
                }
            },
        },
    },
    phone: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            checkPasswordLength(value) {
                if (value && value.length <= 6) {
                    throw new Error("Password should be more than 6 characters.");
                }
            },
        },
    },
    credentialsChangedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    deletedBy: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    profileImage_public_id: { type: sequelize_1.DataTypes.STRING, allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
