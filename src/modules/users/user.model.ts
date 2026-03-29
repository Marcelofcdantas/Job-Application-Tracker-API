import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public mustChangePassword!: boolean;
  public temporaryPasswordExpiresAt!: Date | null;
  public passwordHistory!: string[];
  public failedLoginAttempts!: number;
  public lockedUntil!: Date | null;
  public mfaCodeHash!: string | null;
  public mfaCodeExpiresAt!: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    temporaryPasswordExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordHistory: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mfaCodeHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mfaCodeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "User"
  }
);
