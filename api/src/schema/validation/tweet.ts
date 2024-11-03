import { z } from "zod";

export const tweetPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).optional(),
});

export const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
});

export type TweetPaginationInput = z.infer<typeof tweetPaginationSchema>;
export type CreateTweetInput = z.infer<typeof createTweetSchema>;
