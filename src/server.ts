import app from "./app";
import { connectDB, sequelize } from "./config/database";
import { logger } from "./utils/logger";
import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT || 3000);

async function start() {
  try {
    await connectDB();
    await sequelize.sync();

    app.listen(PORT, () => {
      logger.info({ port: PORT }, "Server running");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

start();
