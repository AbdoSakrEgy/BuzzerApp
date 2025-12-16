import { sequelize } from "../../DB/db.connection";
import { DataTypes } from "sequelize";

export const Category = sequelize.define(
  "categories",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        checkNameLength(value: any) {
          if (value.length <= 2) {
            throw new Error("Category name should be more than 2 characters.");
          }
        },
      },
    },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    freezeTableName: true,
    timestamps: false, 
    paranoid: false,
  }
);
