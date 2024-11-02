export const FriendErrorCodes = {
  REQUEST_PENDING: "requestPending",
  USER_NOT_FOUND: "userNotFound",
  SELF_REQUEST: "selfRequest",
  MAX_FRIENDS: "maxFriends",
  BLOCKED: "blocked",
  REQUEST_FAILED: "requestFailed",
} as const;


export type FriendErrorCode =
  (typeof FriendErrorCodes)[keyof typeof FriendErrorCodes];

// TODO: Add error codes for other modules
// TODO: Use error code when sending error response to client
