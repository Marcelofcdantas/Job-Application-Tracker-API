import { Router } from "express";
import { AuthController } from "../modules/auth/auth.controller";
import { ApplicationController } from "../modules/applications/application.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

const auth = new AuthController();
const app = new ApplicationController();

router.post("/auth/register", auth.register);
router.post("auth/login", auth.login);

router.post("/applications", authMiddleware, app.create);
router.post("/applications", authMiddleware, app.findAll);

export default router;