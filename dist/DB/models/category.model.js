"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const db_connection_1 = require("../../DB/db.connection");
const sequelize_1 = require("sequelize");
exports.Category = db_connection_1.sequelize.define("categories", {
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            checkNameLength(value) {
                if (value.length <= 2) {
                    throw new Error("Category name should be more than 2 characters.");
                }
            },
        },
    },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
}, {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
});
