import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class User extends Model {
  public id!: string;
  public email!: string;
  public name!: string;
  public password!: string;
  public mustChangePassword!: boolean;
  public reset_token!: string | null;
  public reset_token_expires!: Date | null;
  public token_version!: number;
  public password_history!: string[] | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    token_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    password_history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationLastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);
