import { z } from "zod";
import { AppError } from "../common/errors/AppError";

export async function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw AppError.badRequest("Validation failed", error.errors);
    }
    throw error;
  }
}
