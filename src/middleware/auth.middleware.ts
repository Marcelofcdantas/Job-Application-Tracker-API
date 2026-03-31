import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { UserRepository } from "../modules/users/user.repository";

const userRepo = new UserRepository();

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      tokenVersion: number;
    };

    const user = await userRepo.findById(decoded.id);

    if (!user || user.token_version !== decoded.tokenVersion) {
      return next(new AppError("Session expired", 401, "INVALID_TOKEN"));
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      tokenVersion: user.token_version,
      mustChangePassword: user.mustChangePassword,
    };

    next();
  } catch {
    next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
  }
}
