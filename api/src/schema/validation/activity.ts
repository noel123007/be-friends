import { z } from "zod";
import { ActivityType } from '../../types/enums';

export const activityPaginationSchema = z.object({
  userId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  type: z.array(z.nativeEnum(ActivityType)).optional(),
});

export type ActivityPagination = z.infer<typeof activityPaginationSchema>;
