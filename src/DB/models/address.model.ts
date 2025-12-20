import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";
import { RegisterEnum } from "../../types/global.types";

export const Address = sequelize.define(
  "addresses",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // No foreign key - polymorphic relationship (can be admin, customer, cafe, or restaurant)
    },
    user_type: {
      type: DataTypes.ENUM(...Object.values(RegisterEnum)),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Home, Work, etc.",
    },
    city: { type: DataTypes.STRING, allowNull: false },
    area: { type: DataTypes.STRING, allowNull: true },
    street: { type: DataTypes.STRING, allowNull: true },
    building: { type: DataTypes.STRING, allowNull: true },
    floor: { type: DataTypes.STRING, allowNull: true },
    apartment: { type: DataTypes.STRING, allowNull: true },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
  }
);

// No associations defined - polymorphic relationship managed by user_id + user_type
