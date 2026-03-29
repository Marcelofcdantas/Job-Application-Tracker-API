import pino from "pino";

export const logger = pino({
  transport: { target: "pino-pretty" },
  base: undefined,
  level: process.env.NODE_ENV === "production" ? "info" : "debug"
});
