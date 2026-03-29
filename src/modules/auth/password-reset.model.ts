import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export class PasswordReset extends Model {
  public id!: string;
  public userId!: string;
  public token!: string;
  public expiresAt!: Date;
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "PasswordReset"
  }
);
