"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBsync = exports.DBConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize("buzzer", "root", "root", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    logging: false,
});
const DBConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log("DB server connected successfully.");
    }
    catch (err) {
        console.log("DB connection failed:", err);
    }
};
exports.DBConnection = DBConnection;
const DBsync = async () => {
    try {
        await exports.sequelize.sync({ alter: true, force: false });
        console.log("DB sync done.");
    }
    catch (err) {
        console.log("DB sync failed:", err);
    }
};
exports.DBsync = DBsync;
