import express from "express";
import "dotenv/config";
import "./modules/users/user.model";
import "./modules/auth/password-reset.model";
import "./modules/security/audit-log.model";
import router from "./routes/index";
import { errorHandler } from "./middleware/error.middleware";
import { globalLimiter } from "./middleware/rate-limit";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(globalLimiter);
app.use(router);
app.use(errorHandler);

export default app;
