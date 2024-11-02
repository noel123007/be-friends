import { NextFunction, Request, Response } from "express";
import { GraphQLError } from "graphql";
import { AppError } from "../common/errors/AppError";
import { logger } from "../util/logger";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("Error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      errors: [
        {
          message: error.message,
          code: error.code,
          ...(error.errors && { details: error.errors }),
        },
      ],
    });
  }

  if (error instanceof GraphQLError) {
    return res.status(400).json({
      errors: [
        {
          message: error.message,
          code: "GRAPHQL_ERROR",
          locations: error.locations,
          path: error.path,
        },
      ],
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    errors: [
      {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
    ],
  });
}
