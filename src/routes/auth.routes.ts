import { Router } from "express";
import { AuthController } from "../modules/auth/auth.controller"; // Exemplo
import { authLimiter } from "../middleware/rate-limit";
import { validate } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { loginSchema, passwordSchema, refreshSchema, registerSchema, resetConfirmSchema, resetRequestSchema } from "../modules/auth/schema";
import { resetPasswordLimiter } from "../utils/limiter";
import { authMiddleware } from "../middleware/auth.middleware";
import { z } from "zod";

const router = Router();
const auth = new AuthController();

router.get("/me", authMiddleware, auth.getMe);
router.post("/register", authLimiter, validate(registerSchema), asyncHandler(auth.register.bind(auth)));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(auth.login.bind(auth)));
router.post("/refresh", authLimiter, validate(refreshSchema), asyncHandler(auth.refresh.bind(auth)));
router.post("/reset/request", authLimiter, resetPasswordLimiter, validate(resetRequestSchema), asyncHandler(auth.requestReset.bind(auth)));
router.post("/reset/confirm", authLimiter, validate(resetConfirmSchema), asyncHandler(auth.confirmReset.bind(auth)));
router.post(
  "/verify-email",
  asyncHandler(auth.verifyEmail.bind(auth))
);
router.post(
  "/password/change-required",
  authLimiter,
  authMiddleware,
  validate(z.object({ newPassword: passwordSchema })),
  asyncHandler(auth.changePasswordAfterTemporaryLogin.bind(auth))
);

export { router as authRoutes };