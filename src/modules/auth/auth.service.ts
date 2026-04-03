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

  private buildAccessToken(
    userId: string,
    tokenVersion: number,
    rememberMe: boolean = false
  ) {
    const expiresIn = rememberMe ? "7d" : "15m";

    return jwt.sign(
      { id: userId, tokenVersion },
      process.env.JWT_SECRET as string,
      { expiresIn }
    );
  }

  async register(email: string, password: string, _ipAddress?: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new AppError("User already exists", 409);

    validatePassword(password);

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await this.userRepo.create({
      email,
      password: hashed,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendMail(
      user.email,
      "Verify your email",
      `
      <h2>Welcome!</h2>
      <p>Click below to verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
      `
    );

    const { password: _password, ...safe } = user.toJSON();
    return safe;
  }

  async login(email: string, password: string, rememberMe: boolean = false, _ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isEmailVerified) {

      const now = new Date();

      const canResend =
        !user.emailVerificationLastSentAt ||
        now.getTime() - new Date(user.emailVerificationLastSentAt).getTime() > 15 * 60 * 1000;

      if (canResend) {
        const token = crypto.randomBytes(32).toString("hex");

        await this.userRepo.update(user.id, {
          emailVerificationToken: token,
          emailVerificationLastSentAt: new Date(),
        });

        const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        await sendMail(user.email, "Verify your email", `
          <p>Click below to verify your email:</p>
          <a href="${verifyLink}">Verify Email</a>
        `);
      }

      const nextTryIn = user.emailVerificationLastSentAt
        ? Math.ceil(
            (15 * 60 * 1000 - (now.getTime() - new Date(user.emailVerificationLastSentAt).getTime())) / 60000
          )
        : 0;

      let message = "Email not verified. Check your inbox.";

      if (nextTryIn === 1) {
        message += " Try again in 1 minute.";
      } else if (nextTryIn > 1) {
        message += ` Try again in ${nextTryIn} minutes.`;
      }

      throw new AppError(message, 403);
    }

    const accessToken = this.buildAccessToken(user.id, user.token_version, rememberMe);

    return { accessToken };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findByVerificationToken(token);

    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }

    await this.userRepo.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });

    return { message: "Email verified successfully" };
  }

  async resendVerification(email: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) return;

    if (user.isEmailVerified) {
      throw new AppError("Email already verified", 400);
    }

    const token = crypto.randomBytes(32).toString("hex");

    await this.userRepo.update(user.id, {
      emailVerificationToken: token,
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await sendMail(
      user.email,
      "Verify your email",
      `
      <p>Click below to verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
      `
    );
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
