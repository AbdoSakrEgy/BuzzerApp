import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";

export const Admin = sequelize.define(
  "admins",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkNameLength(value: any) {
          if (value.length <= 2) {
            throw new Error("Full name should be more than 2 characters.");
          }
        },
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 18,
        max: 200,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkPasswordLength(value: any) {
          if (value.length <= 6) {
            throw new Error("Password should be more than 6 characters.");
          }
        },
      },
    },
    credentialsChangedAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    deletedBy: { type: DataTypes.INTEGER, allowNull: true },
    profileImage_public_id: { type: DataTypes.STRING, allowNull: true },
    profileImage_secure_url: { type: DataTypes.STRING, allowNull: true },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);
