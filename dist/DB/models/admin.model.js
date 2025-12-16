"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
exports.Admin = db_connection_1.sequelize.define("admins", {
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
    age: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 18,
            max: 200,
        },
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            checkPasswordLength(value) {
                if (value.length <= 6) {
                    throw new Error("Password should be more than 6 characters.");
                }
            },
        },
    },
    credentialsChangedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    isActive: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    deletedBy: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    profileImage_public_id: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    profileImage_secure_url: { type: sequelize_1.DataTypes.STRING, allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
