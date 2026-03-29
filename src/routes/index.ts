import { Router } from "express";
import { AuthController } from "../modules/auth/auth.controller.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  resetConfirmSchema,
  resetRequestSchema,
  verifyMfaSchema,
  passwordSchema
} from "../modules/auth/schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rate-limit.js";
import { z } from "zod";

const router = Router();
const auth = new AuthController();

router.post("/auth/register", authLimiter, validate(registerSchema), asyncHandler(auth.register.bind(auth)));
router.post("/auth/login", authLimiter, validate(loginSchema), asyncHandler(auth.login.bind(auth)));
router.post("/auth/mfa/verify", authLimiter, validate(verifyMfaSchema), asyncHandler(auth.verifyMfa.bind(auth)));
router.post("/auth/refresh", authLimiter, validate(refreshSchema), asyncHandler(auth.refresh.bind(auth)));
router.post("/auth/reset/request", authLimiter, validate(resetRequestSchema), asyncHandler(auth.requestReset.bind(auth)));
router.post("/auth/reset/confirm", authLimiter, validate(resetConfirmSchema), asyncHandler(auth.confirmReset.bind(auth)));
router.post(
  "/auth/password/change-required",
  authLimiter,
  authMiddleware,
  validate(z.object({ newPassword: passwordSchema })),
  asyncHandler(auth.changePasswordAfterTemporaryLogin.bind(auth))
);

export default router;
