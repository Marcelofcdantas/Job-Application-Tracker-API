import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must have at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[@$!%*?&]/, "Password must include at least one special character");

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const resetRequestSchema = z.object({
  email: z.string().email(),
  mode: z.enum(["link", "temp"]).optional()
});

export const resetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema
});
