import { z } from "zod";
import { NotificationType } from "../../types/enums";

export const notificationFiltersSchema = z.object({
  type: z.array(z.nativeEnum(NotificationType)).optional(),
  isRead: z.boolean().optional(),
});

export const notificationPreferencesSchema = z.object({
  friendRequests: z.boolean().optional(), 
  system: z.boolean().optional(), 
});

export type NotificationFilters = z.infer<typeof notificationFiltersSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
