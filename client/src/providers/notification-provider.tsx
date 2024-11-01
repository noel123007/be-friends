import { useToast } from '@/components/ui/use-toast';
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  NOTIFICATION_RECEIVED,
  NOTIFICATION_UPDATED,
} from '@/graphql/notification';
import type { Notification, NotificationFilters } from '@/types/notification';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error?: Error;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  filterNotifications: (filters: NotificationFilters) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['notifications']);
  const { toast } = useToast();

  // Fetch notifications
  const { data, loading, error } = useQuery(GET_NOTIFICATIONS);

  // Mutations
  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);

  // Subscribe to new notifications
  useSubscription(NOTIFICATION_RECEIVED, {
    onData: ({ data }) => {
      if (data.data) {
        toast({
          title: data.data.notificationReceived.title,
          description: data.data.notificationReceived.message,
        });
      }
    },
  });

  // Subscribe to notification updates
  useSubscription(NOTIFICATION_UPDATED);

  const notifications = useMemo(() => data?.notifications || [], [data]);

  const unreadCount = useMemo(
    () => notifications.filter((n: Notification) => !n.isRead).length,
    [notifications]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationRead({ variables: { id } });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('notifications:errors.markReadFailed'),
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    },
    [markNotificationRead, toast, t]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const promises = notifications
        .filter((n: Notification) => !n.isRead)
        .map((n: Notification) => markNotificationRead({ variables: { id: n.id } }));
      await Promise.all(promises);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('notifications:errors.markAllReadFailed'),
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, [notifications, markNotificationRead, toast, t]);

  const filterNotifications = useCallback(
    (filters: NotificationFilters) => {
      return notifications.filter((notification: Notification) => {
        if (filters.type && !filters.type.includes(notification.type)) return false;
        if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false;
        return true;
      });
    },
    [notifications]
  );

  const value = {
    notifications,
    unreadCount,
    isLoading: loading,
    error,
    markAsRead,
    markAllAsRead,
    filterNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
