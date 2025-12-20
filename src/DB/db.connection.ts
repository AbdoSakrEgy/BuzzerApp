import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("buzzer", "root", "root", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: false,
});

export const DBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB server connected successfully.");
  } catch (err) {
    console.log("DB connection failed:", err);
  }
};
export const DBsync = async () => {
  try {
    await sequelize.sync({ alter: true, force: false });
    console.log("DB sync done.");
  } catch (err) {
    console.log("DB sync failed:", err);
  }
};
