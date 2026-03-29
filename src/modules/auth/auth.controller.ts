import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await service.register(email, password, req.ip);

    return res.status(201).json({
      data: user,
      message: "User created"
    });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const data = await service.login(email, password, req.ip);

    return res.json({
      data,
      message: "Password accepted. MFA verification required."
    });
  }

  async verifyMfa(req: Request, res: Response) {
    const { email, code } = req.body;
    const data = await service.verifyMfa(email, code, req.ip);

    return res.json({
      data,
      message: "Login successful"
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const data = await service.refresh(refreshToken, req.ip);

    return res.json({ data });
  }

  async requestReset(req: Request, res: Response) {
    const { email, mode } = req.body;
    await service.requestReset(email, mode, req.ip);

    return res.json({
      message: "If the email exists, reset instructions were sent."
    });
  }

  async confirmReset(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    await service.confirmReset(token, newPassword, req.ip);

    return res.json({
      message: "Password updated successfully"
    });
  }

  async changePasswordAfterTemporaryLogin(req: Request, res: Response) {
    const userId = (req as any).user.id as string;
    const { newPassword } = req.body;
    await service.changePasswordAfterTemporaryLogin(userId, newPassword, req.ip);

    return res.json({
      message: "Password changed successfully"
    });
  }
}
