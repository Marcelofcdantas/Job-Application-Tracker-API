import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (err instanceof AppError) {
    logger.warn({ path: req.path, message: err.message, code: err.code }, "Handled application error");
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code
    });
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  return res.status(500).json({
    message: "Internal server error"
  });
}
