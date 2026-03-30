import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class AuditLog extends Model {
  public id!: string;
  public userId!: string | null;
  public event!: string;
  public ipAddress!: string | null;
  public metadata!: Record<string, unknown> | null;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "AuditLog"
  }
);
