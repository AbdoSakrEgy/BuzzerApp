"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
exports.Restaurant = db_connection_1.sequelize.define("restaurants", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            checkNameLength(value) {
                if (value.length <= 2) {
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
    isEmailConfirmed: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
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
    is2FAActive: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    profileImage_public_id: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    profileImage_secure_url: { type: sequelize_1.DataTypes.STRING, allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
