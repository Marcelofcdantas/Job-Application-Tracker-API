import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";
import { sendMail } from "../../utils/mailer.js";
import { getEnvNumber } from "../../config/env.js";
import { UserRepository } from "../users/user.repository.js";
import { PasswordResetRepository } from "./password-reset.repository.js";
import { SecurityLogService } from "../security/security-log.service.js";

export class AuthService {
  private userRepo = new UserRepository();
  private resetRepo = new PasswordResetRepository();
  private securityLogger = new SecurityLogService();

  private buildAccessToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "15m"
    });
  }

  private buildRefreshToken(userId: string) {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: "7d"
    });
  }

  private getResetExpiryDate() {
    return new Date(Date.now() + getEnvNumber("RESET_TTL_MINUTES", 60) * 60 * 1000);
  }

  private getMfaExpiryDate() {
    return new Date(Date.now() + getEnvNumber("MFA_CODE_TTL_MINUTES", 5) * 60 * 1000);
  }

  private getLockExpiryDate() {
    return new Date(Date.now() + getEnvNumber("LOCK_MINUTES", 15) * 60 * 1000);
  }

  private async assertPasswordNotReused(newPassword: string, currentHash: string, history: string[]) {
    const hashesToCheck = [currentHash, ...history].slice(0, 4);

    for (const hash of hashesToCheck) {
      const reused = await bcrypt.compare(newPassword, hash);
      if (reused) {
        throw new AppError(
          "New password cannot match the current password or the last 3 passwords",
          400,
          "PASSWORD_REUSE"
        );
      }
    }
  }

  private async updatePasswordWithHistory(userId: string, newHashedPassword: string, currentHash: string, history: string[]) {
    const newHistory = [currentHash, ...history].slice(0, 3);
    await this.userRepo.updateSecurityState(userId, {
      password: newHashedPassword,
      passwordHistory: newHistory,
      mustChangePassword: false,
      temporaryPasswordExpiresAt: null
    });
  }

  async register(email: string, password: string, ipAddress?: string) {
    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser) {
      await this.securityLogger.record("register_failed_existing_email", {
        userId: existingUser.id,
        ipAddress,
        metadata: { email }
      });
      throw new AppError("User already exists", 409, "USER_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create({
      email,
      password: hashedPassword,
      passwordHistory: []
    });

    await this.securityLogger.record("register_success", {
      userId: user.id,
      ipAddress,
      metadata: { email }
    });

    const { password: _password, ...safeUser } = user.toJSON();
    return safeUser;
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      await this.securityLogger.record("login_failed_unknown_email", {
        ipAddress,
        metadata: { email }
      });
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      await this.securityLogger.record("login_blocked_locked_account", {
        userId: user.id,
        ipAddress
      });
      throw new AppError("Account temporarily locked. Try again later.", 423, "ACCOUNT_LOCKED");
    }

    if (user.mustChangePassword && user.temporaryPasswordExpiresAt) {
      if (new Date() > new Date(user.temporaryPasswordExpiresAt)) {
        await this.securityLogger.record("login_failed_temp_password_expired", {
          userId: user.id,
          ipAddress
        });
        throw new AppError("Temporary password expired. Request a new reset.", 401, "TEMP_PASSWORD_EXPIRED");
      }
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      const maxAttempts = getEnvNumber("MAX_LOGIN_ATTEMPTS", 5);
      const nextAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextAttempts >= maxAttempts;

      await this.userRepo.updateSecurityState(user.id, {
        failedLoginAttempts: shouldLock ? 0 : nextAttempts,
        lockedUntil: shouldLock ? this.getLockExpiryDate() : null
      });

      await this.securityLogger.record("login_failed_bad_password", {
        userId: user.id,
        ipAddress,
        metadata: { nextAttempts, locked: shouldLock }
      });

      if (shouldLock) {
        throw new AppError("Account temporarily locked due to too many failed attempts.", 423, "ACCOUNT_LOCKED");
      }

      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const mfaCode = String(Math.floor(100000 + Math.random() * 900000));
    const mfaCodeHash = await bcrypt.hash(mfaCode, 10);

    await this.userRepo.updateSecurityState(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      mfaCodeHash,
      mfaCodeExpiresAt: this.getMfaExpiryDate()
    });

    await sendMail(
      user.email,
      "Your verification code",
      `<p>Your verification code is <b>${mfaCode}</b>.</p><p>It expires in ${getEnvNumber("MFA_CODE_TTL_MINUTES", 5)} minutes.</p>`
    );

    await this.securityLogger.record("login_password_verified_mfa_sent", {
      userId: user.id,
      ipAddress
    });

    return {
      message: "Password verified. MFA code sent to the registered email."
    };
  }

  async verifyMfa(email: string, code: string, ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user || !user.mfaCodeHash || !user.mfaCodeExpiresAt) {
      await this.securityLogger.record("mfa_failed_missing_state", {
        ipAddress,
        metadata: { email }
      });
      throw new AppError("MFA challenge not found", 400, "MFA_NOT_FOUND");
    }

    if (new Date() > new Date(user.mfaCodeExpiresAt)) {
      await this.userRepo.updateSecurityState(user.id, {
        mfaCodeHash: null,
        mfaCodeExpiresAt: null
      });
      await this.securityLogger.record("mfa_failed_expired", {
        userId: user.id,
        ipAddress
      });
      throw new AppError("MFA code expired", 401, "MFA_EXPIRED");
    }

    const validCode = await bcrypt.compare(code, user.mfaCodeHash);
    if (!validCode) {
      await this.securityLogger.record("mfa_failed_invalid_code", {
        userId: user.id,
        ipAddress
      });
      throw new AppError("Invalid MFA code", 401, "INVALID_MFA_CODE");
    }

    await this.userRepo.updateSecurityState(user.id, {
      mfaCodeHash: null,
      mfaCodeExpiresAt: null
    });

    await this.securityLogger.record("login_success", {
      userId: user.id,
      ipAddress
    });

    return {
      accessToken: this.buildAccessToken(user.id),
      refreshToken: this.buildRefreshToken(user.id),
      mustChangePassword: user.mustChangePassword
    };
  }

  async refresh(refreshToken: string, ipAddress?: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
      await this.securityLogger.record("refresh_success", {
        userId: decoded.id,
        ipAddress
      });
      return {
        accessToken: this.buildAccessToken(decoded.id)
      };
    } catch {
      await this.securityLogger.record("refresh_failed_invalid_token", { ipAddress });
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }
  }

  async requestReset(email: string, mode: "link" | "temp" = "link", ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      await this.securityLogger.record("reset_request_unknown_email", {
        ipAddress,
        metadata: { email, mode }
      });
      return;
    }

    await this.resetRepo.deleteByUserId(user.id);

    if (mode === "temp") {
      const temporaryPassword = crypto.randomBytes(9).toString("base64url");
      await this.assertPasswordNotReused(temporaryPassword, user.password, user.passwordHistory || []);

      const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 12);

      await this.userRepo.updateSecurityState(user.id, {
        password: hashedTemporaryPassword,
        mustChangePassword: true,
        temporaryPasswordExpiresAt: this.getResetExpiryDate()
      });

      await sendMail(
        user.email,
        "Your temporary password",
        `<p>Your temporary password is <b>${temporaryPassword}</b>.</p><p>It expires in ${getEnvNumber("RESET_TTL_MINUTES", 60)} minutes and must be changed on the next login.</p>`
      );

      await this.securityLogger.record("reset_temp_password_sent", {
        userId: user.id,
        ipAddress
      });

      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = this.getResetExpiryDate();

    await this.resetRepo.create({
      userId: user.id,
      token,
      expiresAt
    });

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const link = `${baseUrl}/auth/reset/confirm?token=${token}`;

    await sendMail(
      user.email,
      "Reset your password",
      `<p>Use the link below to reset your password. It expires in ${getEnvNumber("RESET_TTL_MINUTES", 60)} minutes.</p><a href="${link}">${link}</a>`
    );

    await this.securityLogger.record("reset_link_sent", {
      userId: user.id,
      ipAddress
    });
  }

  async confirmReset(token: string, newPassword: string, ipAddress?: string) {
    const resetRecord = await this.resetRepo.findByToken(token);

    if (!resetRecord) {
      await this.securityLogger.record("reset_confirm_invalid_token", { ipAddress });
      throw new AppError("Invalid reset token", 400, "INVALID_RESET_TOKEN");
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      await this.resetRepo.deleteByToken(token);
      await this.securityLogger.record("reset_confirm_expired_token", {
        userId: resetRecord.userId,
        ipAddress
      });
      throw new AppError("Reset token expired", 400, "RESET_TOKEN_EXPIRED");
    }

    const user = await this.userRepo.findById(resetRecord.userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    await this.assertPasswordNotReused(newPassword, user.password, user.passwordHistory || []);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.updatePasswordWithHistory(
      user.id,
      hashedPassword,
      user.password,
      user.passwordHistory || []
    );

    await this.resetRepo.deleteByToken(token);

    await this.securityLogger.record("reset_confirm_success", {
      userId: user.id,
      ipAddress
    });
  }

  async changePasswordAfterTemporaryLogin(userId: string, newPassword: string, ipAddress?: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (!user.mustChangePassword) {
      throw new AppError("Password change not required", 400, "PASSWORD_CHANGE_NOT_REQUIRED");
    }

    if (user.temporaryPasswordExpiresAt && new Date() > new Date(user.temporaryPasswordExpiresAt)) {
      throw new AppError("Temporary password expired", 401, "TEMP_PASSWORD_EXPIRED");
    }

    await this.assertPasswordNotReused(newPassword, user.password, user.passwordHistory || []);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.updatePasswordWithHistory(
      user.id,
      hashedPassword,
      user.password,
      user.passwordHistory || []
    );

    await this.securityLogger.record("temporary_password_changed_successfully", {
      userId,
      ipAddress
    });
  }
}
