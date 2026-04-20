import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body;
    const user = await service.register(email, password, name, req.ip);

    return res.status(201).json({
      data: user,
      message: "User created"
    });
  }

  async login(req: Request, res: Response) {
    const { email, password, rememberMe} = req.body;
    const data = await service.login(email, password, rememberMe, req.ip);

    return res.json({
      data,
      message: "Login successful."
    });
  }

  async getMe(req: Request, res: Response) {
    const { userId } = req.body;
    const data = await service.getMe(userId);

    return res.json({
      data
    });
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body;
    const data = await service.verifyEmail(token);

    return res.json({ data });
    }

    async resendVerification(req: Request, res: Response) {
    const { email } = req.body;

    await service.resendVerification(email);

    return res.json({
      message: "If the email exists, a verification email was sent"
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
