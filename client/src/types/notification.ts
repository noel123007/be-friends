export type NotificationType = 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'MESSAGE' | 'SYSTEM';

export interface NotificationData {
  userId?: string;
  requestId?: string;
  messageId?: string;
  url?: string;
  actionType?: string;
  metadata?: Record<string, string>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: NotificationData;
}

export interface NotificationPreferences {
  friendRequests: boolean;
  messages: boolean;
  system: boolean;
  emailNotifications: boolean;
}

export interface NotificationFilters {
  type?: NotificationType[];
  isRead?: boolean;
}
