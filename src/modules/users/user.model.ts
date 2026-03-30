import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public mustChangePassword!: boolean;
}

User.init({
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
  }
}, {
  sequelize,
  modelName: "User"
});
