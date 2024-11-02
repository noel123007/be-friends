import { z } from "zod";

export const socialLinksSchema = z.object({
  twitter: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  location: z
    .string()
    .max(100, "Location must not exceed 100 characters")
    .optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal('')),
  socialLinks: socialLinksSchema.optional(),
});

export const uploadImageSchema = z.object({
  file: z.any(),
  type: z.enum(["AVATAR", "COVER"]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
