import { Router } from "express";
import { AuthController } from "../modules/auth/auth.controller";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  resetConfirmSchema,
  resetRequestSchema,
  passwordSchema
} from "../modules/auth/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rate-limit";
import { z } from "zod";
import { ApplicationController } from "../modules/applications/application.controller";
import { resetPasswordLimiter } from "../utils/limiter";

const application = new ApplicationController();

const router = Router();
const auth = new AuthController();

router.post("/auth/register", authLimiter, validate(registerSchema), asyncHandler(auth.register.bind(auth)));
router.post("/auth/login", authLimiter, validate(loginSchema), asyncHandler(auth.login.bind(auth)));
router.post("/auth/refresh", authLimiter, validate(refreshSchema), asyncHandler(auth.refresh.bind(auth)));
router.post("/auth/reset/request", authLimiter, resetPasswordLimiter, validate(resetRequestSchema), asyncHandler(auth.requestReset.bind(auth)));
router.post("/auth/reset/confirm", authLimiter, validate(resetConfirmSchema), asyncHandler(auth.confirmReset.bind(auth)));
router.post(
  "/auth/verify-email",
  asyncHandler(auth.verifyEmail.bind(auth))
);
router.post(
  "/auth/password/change-required",
  authLimiter,
  authMiddleware,
  validate(z.object({ newPassword: passwordSchema })),
  asyncHandler(auth.changePasswordAfterTemporaryLogin.bind(auth))
);

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

export default router;
