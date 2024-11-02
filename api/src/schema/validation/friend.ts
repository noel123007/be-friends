import { z } from "zod";

export const friendRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const friendRequestActionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
});

export const friendPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

export type FriendRequest = z.infer<typeof friendRequestSchema>;
export type FriendRequestAction = z.infer<typeof friendRequestActionSchema>;
export type FriendPagination = z.infer<typeof friendPaginationSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
