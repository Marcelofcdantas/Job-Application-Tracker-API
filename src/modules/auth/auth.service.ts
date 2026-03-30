import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../users/user.repository";
import { PasswordResetRepository } from "./password-reset.repository";
import { sendMail } from "../../utils/mailer";

export class AuthService {
  private userRepo = new UserRepository();
  private resetRepo = new PasswordResetRepository();

  private buildAccessToken(userId: string) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
  }

  async register(email: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new AppError("User already exists", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      email,
      password: hashed,
    });

    const { password: _, ...safe } = user.toJSON();
    return safe;
  }

  async login(email: string, password: string, ipAddress?: string) {
    console.log("SIGN SECRET:", process.env.JWT_SECRET);
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = this.buildAccessToken(user.id);

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

    console.log("🔥 MAGIC LINK SENT:", link);

    return {
      message: "Check your email to login.",
    };
  }


  async verifyEmail(token: string) {
  console.log("TOKEN RECEBIDO:", token);
  console.log("VERIFY SECRET:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    console.log("DECODED:", decoded);

    const user = await this.userRepo.findById(decoded.id);
    if (!user) throw new AppError("User not found", 404);

    return {
      accessToken: token,
    };

  } catch (err: any) {
    console.error("JWT ERROR REAL:", err.message);

    throw new AppError(err.message, 400);
  }
}


  async refresh(token: string) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET as string
      );

      const accessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "15m" }
      );

      return { accessToken };
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }


  async requestReset(email: string, mode: "link" | "temp" = "link") {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return;

    if (mode === "temp") {
      const temp = crypto.randomBytes(6).toString("base64url");
      const hashed = await bcrypt.hash(temp, 10);

      await this.userRepo.updatePassword(user.id, hashed, true);

      await sendMail(
        user.email,
        "Temporary password",
        `<p>Your temporary password: <b>${temp}</b></p>
         <p>You must change it after login.</p>`
      );

      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await this.resetRepo.create({
      userId: user.id,
      token,
      expiresAt: expires,
    });

    const base =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const link = `${base}/reset-password?token=${token}`;

    await sendMail(
      user.email,
      "Reset password",
      `<p>Click to reset your password:</p>
       <a href="${link}">${link}</a>`
    );
  }

  async confirmReset(token: string, newPassword: string) {
    const rec = await this.resetRepo.findValid(token);
    if (!rec) throw new AppError("Invalid token", 400);

    if (new Date() > new Date(rec.expiresAt)) {
      await this.resetRepo.deleteByToken(token);
      throw new AppError("Token expired", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.userRepo.updatePassword(rec.userId, hashed, false);
    await this.resetRepo.deleteByToken(token);
  }
}