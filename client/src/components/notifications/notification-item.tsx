import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/providers/notification-provider';
import type { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { t } = useTranslation(['notifications']);
  const { markAsRead } = useNotifications();

  const handleMarkAsRead = async () => {
    await markAsRead(notification.id);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        return '👥';
      case 'FRIEND_ACCEPTED':
        return '🤝';
      case 'MESSAGE':
        return '💬';
      case 'SYSTEM':
        return '🔔';
      default:
        return '📫';
    }
  };

  const getNotificationLink = () => {
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        return `/friends?request=${notification.data?.requestId}`;
      case 'MESSAGE':
        return `/chat?message=${notification.data?.messageId}`;
      case 'SYSTEM':
        return notification.data?.url || '/';
      default:
        return '/';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-4 border-b px-4 py-3 hover:bg-muted/50',
        !notification.isRead && 'bg-muted/30'
      )}
    >
      <div className="text-xl" aria-hidden="true">
        {getNotificationIcon()}
      </div>
      <div className="flex-1 space-y-1">
        <Link
          to={getNotificationLink()}
          className="block text-sm font-medium leading-none hover:underline"
          tabIndex={0}
        >
          {notification.title}
        </Link>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMarkAsRead}
          className="h-8 w-8"
          aria-label={t('notifications:actions.markAsRead')}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
