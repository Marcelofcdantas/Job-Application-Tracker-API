import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../users/user.repository";
import { PasswordResetRepository } from "./password-reset.repository";
import { sendMail } from "../../utils/mailer";

function validatePassword(password: string) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!regex.test(password)) {
    throw new AppError(
      "Password must have 8+ chars, upper, lower, number and special char",
      400
    );
  }
}

async function ensurePasswordWasNotUsedBefore(
  newPassword: string,
  passwordHistory: string[] = []
) {
  for (const oldHash of passwordHistory) {
    const match = await bcrypt.compare(newPassword, oldHash);
    if (match) {
      throw new AppError("You cannot reuse your last 3 passwords", 400);
    }
  }
}

export class AuthService {
  private userRepo = new UserRepository();
  private resetRepo = new PasswordResetRepository();

  private buildAccessToken(userId: string, tokenVersion: number) {
    return jwt.sign(
      { id: userId, tokenVersion },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
  }

  async register(email: string, password: string, _ipAddress?: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new AppError("User already exists", 409);

    validatePassword(password);

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      email,
      password: hashed,
    });

    const { password: _password, ...safe } = user.toJSON();
    return safe;
  }

  async login(email: string, password: string, _ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = this.buildAccessToken(user.id, user.token_version);
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Login to Job Tracker</h2>
        <p>Click the button below to access your account:</p>
        <a href="${link}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:white;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
          ">
          Login to your account
        </a>
        <p style="margin-top:20px; font-size:12px; color:gray;">
          This link expires in 15 minutes.
        </p>
      </div>
    `;

    await sendMail(user.email, "Login to Job Tracker", html);

    return {
      message: "Check your email to login.",
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string; tokenVersion: number };

      const user = await this.userRepo.findById(decoded.id);
      if (!user) throw new AppError("User not found", 404);

      if (user.token_version !== decoded.tokenVersion) {
        throw new AppError("Session expired", 401);
      }

      return {
        accessToken: token,
      };
    } catch (err: any) {
      throw new AppError(err.message || "Invalid token", 400);
    }
  }

  async refresh(token: string, _ipAddress?: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET as string
      ) as { id: string; tokenVersion?: number };

      const user = await this.userRepo.findById(decoded.id);
      if (!user) {
        throw new AppError("Invalid refresh token", 401);
      }

      const accessToken = this.buildAccessToken(user.id, user.token_version);

      return { accessToken };
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  async requestReset(
    email: string,
    mode: "link" | "temp" = "link",
    _ipAddress?: string
  ) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return;

    const lastRequest = await this.resetRepo.findRecentByUserId(user.id);
    if (lastRequest) {
      throw new AppError("Please wait before requesting again", 429);
    }

    if (mode === "link") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const expires = new Date(Date.now() + 1000 * 60 * 60);

      await this.userRepo.saveResetToken(user.id, hashedToken, expires);
      await this.resetRepo.deleteByUserId(user.id);
      await this.resetRepo.create({
        userId: user.id,
        token: hashedToken,
        expiresAt: expires,
      });

      const base = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetLink = `${base}/reset-password?token=${rawToken}`;

      await sendMail(
        user.email,
        "Reset your password",
        `<p>Click the link below to reset your password:</p>
         <a href="${resetLink}">${resetLink}</a>`
      );

      return;
    }

    const temp = crypto.randomBytes(6).toString("base64url");
    const hashed = await bcrypt.hash(temp, 10);

    const updatedHistory = [
      ...((user.password_history || []) as string[]),
      user.password,
    ].slice(-3);

    await this.userRepo.updateSecurityState(user.id, {
      password: hashed,
      mustChangePassword: true,
      passwordHistory: updatedHistory,
      token_version: (user.token_version ?? 0) + 1,
    });

    await sendMail(
      user.email,
      "Temporary password",
      `<p>Your temporary password: <b>${temp}</b></p>
       <p>You must change it after login.</p>`
    );
  }

  async confirmReset(token: string, newPassword: string, _ipAddress?: string) {
    validatePassword(newPassword);

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await this.userRepo.findByResetToken(hashedToken);

    if (!user || !user.reset_token_expires) {
      throw new AppError("Invalid or expired token", 400);
    }

    if (user.reset_token_expires < new Date()) {
      await this.userRepo.clearResetToken(user.id);
      await this.resetRepo.deleteByUserId(user.id);
      throw new AppError("Token expired", 400);
    }

    await ensurePasswordWasNotUsedBefore(
      newPassword,
      (user.password_history || []) as string[]
    );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedHistory = [
      ...((user.password_history || []) as string[]),
      user.password,
    ].slice(-3);

    await this.userRepo.updateSecurityState(user.id, {
      password: hashedPassword,
      mustChangePassword: false,
      passwordHistory: updatedHistory,
      token_version: (user.token_version ?? 0) + 1,
    });

    await this.userRepo.clearResetToken(user.id);
    await this.resetRepo.deleteByUserId(user.id);
  }

  async changePasswordAfterTemporaryLogin(
    userId: string,
    newPassword: string,
    _ipAddress?: string
  ) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    validatePassword(newPassword);
    await ensurePasswordWasNotUsedBefore(
      newPassword,
      (user.password_history || []) as string[]
    );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedHistory = [
      ...((user.password_history || []) as string[]),
      user.password,
    ].slice(-3);

    await this.userRepo.updateSecurityState(user.id, {
      password: hashedPassword,
      mustChangePassword: false,
      passwordHistory: updatedHistory,
      token_version: (user.token_version ?? 0) + 1,
    });
  }
}
