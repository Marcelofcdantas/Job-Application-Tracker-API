import express from "express";
import "dotenv/config";
import "./modules/users/user.model.js";
import "./modules/auth/password-reset.model.js";
import "./modules/security/audit-log.model.js";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { globalLimiter } from "./middleware/rate-limit.js";

const app = express();

app.use(express.json());
app.use(globalLimiter);
app.use(router);
app.use(errorHandler);

export default app;
