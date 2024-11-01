export type ActivityType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'PROFILE_UPDATE'
  | 'POST_CREATED'
  | 'COMMENT_ADDED';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  data?: {
    friendId?: string;
    postId?: string;
    commentId?: string;
    [key: string]: unknown;
  };
}
