import { GraphQLFormattedError } from "graphql";
import { AppError } from "../common/errors/AppError";

export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  if (error instanceof AppError) {
    return {
      message: error.code ?? "Unknown error",
      locations: formattedError.locations,
      path: formattedError.path,
    };
  }

  return formattedError;
}
