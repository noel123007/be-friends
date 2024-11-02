import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($filters: NotificationFilters) {
    notifications(filters: $filters) {
      id
      type
      title
      message
      isRead
      createdAt
      data {
        userId
        requestId
        messageId
      }
    }
  }
`;

export const GET_NOTIFICATION_PREFERENCES = gql`
  query GetNotificationPreferences {
    notificationPreferences {
      friendRequests
      system
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences($input: NotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      friendRequests
      system
    }
  }
`;

export const NOTIFICATION_RECEIVED = gql`
  subscription OnNotificationReceived {
    notificationReceived {
      id
      type
      title
      message
      isRead
      createdAt
      data {
        userId
        requestId
        messageId
      }
    }
  }
`;

export const NOTIFICATION_UPDATED = gql`
  subscription OnNotificationUpdated {
    notificationUpdated {
      id
      isRead
    }
  }
`;
