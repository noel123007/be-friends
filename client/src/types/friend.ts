export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface SearchUserResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  friendStatus?: FriendStatus;
}
