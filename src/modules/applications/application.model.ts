import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export class Application extends Model {
    public id!: string;
    public company!: string;
    public jobTitle!: string;
    public status!: string;
    public userId!: string;
}

Application.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        company: DataTypes.STRING,
        jobTitle: DataTypes.STRING,
        status: DataTypes.STRING,
        notes: DataTypes.STRING,
        appliedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Application",
    }
);