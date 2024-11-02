export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(403, message, "FORBIDDEN");
  }

  static badRequest(message: string, errors?: any[]): AppError {
    return new AppError(400, message, "BAD_REQUEST", errors);
  }

  static notFound(message: string): AppError {
    return new AppError(404, message, "NOT_FOUND");
  }

  static internal(message = "Internal Server Error"): AppError {
    return new AppError(500, message, "INTERNAL_SERVER_ERROR");
  }
}
