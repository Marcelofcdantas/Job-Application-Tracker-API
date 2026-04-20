export class AppError extends Error {
  statusCode: number;
  code?: string;
  shouldCountTowardsRateLimit: boolean;

  constructor(
    message: string, 
    statusCode = 400, 
    code?: string, 
    shouldCountTowardsRateLimit = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.shouldCountTowardsRateLimit = shouldCountTowardsRateLimit;
  }
}
