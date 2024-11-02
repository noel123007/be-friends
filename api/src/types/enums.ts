export enum FriendStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  FRIENDS = "FRIENDS",
  BLOCKED = "BLOCKED",
}

export enum FriendRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum ActivityType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPT = "FRIEND_ACCEPT",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  SYSTEM = "SYSTEM",
}

export enum NotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPT = "FRIEND_ACCEPT",
  SYSTEM = "SYSTEM", 
}
