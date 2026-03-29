import { Sequelize } from "sequelize";
import { getEnv } from "./env.js";

export const sequelize = new Sequelize(
  getEnv("DB_NAME"),
  getEnv("DB_USER"),
  getEnv("DB_PWD"),
  {
    host: getEnv("DB_HOST"),
    dialect: "mysql",
    logging: false,
  }
);