export enum FriendStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  FRIENDS = 'FRIENDS',
  BLOCKED = 'BLOCKED',
}

export interface Friend {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: FriendStatus;
}

export interface SearchUserResult extends User {
  friendStatus: FriendStatus;
}
