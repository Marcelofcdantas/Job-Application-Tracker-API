import { Router } from "express";
import { AuthController } from "../modules/auth/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rate-limit";
import { ApplicationController } from "../modules/applications/application.controller";
import { authRoutes } from "./auth.routes";

const application = new ApplicationController();

const router = Router();
const auth = new AuthController();

router.use("/auth", authLimiter, authRoutes);

router.post(
  "/applications",
  authMiddleware,
  asyncHandler(application.create.bind(application))
);

router.get(
  "/applications",
  authMiddleware,
  asyncHandler(application.getAll.bind(application))
);

router.get(
  "/applications/archived",
  authMiddleware,
  asyncHandler(application.getArchived.bind(application))
);

router.get(
  "/applications/:id",
  authMiddleware,
  asyncHandler(application.getById.bind(application))
);

router.put(
  "/applications/:id",
  authMiddleware,
  asyncHandler(application.update.bind(application))
);

router.delete(
  "/applications/:id",
  authMiddleware,
  asyncHandler(application.delete.bind(application))
);

router.post(
  "/applications/:id/archive",
  authMiddleware,
  asyncHandler(application.archive.bind(application))
);

router.get(
  "/analytics",
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json({ message: "ok" });
  })
);

export default router;
