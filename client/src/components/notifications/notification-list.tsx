import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/providers/notification-provider';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationItem } from './notification-item';

export function NotificationList() {
  const { t } = useTranslation(['notifications']);
  const { notifications, markAllAsRead, isLoading } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {t('notifications:list.loading')}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {t('notifications:list.empty')}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h4 className="text-sm font-medium">{t('notifications:list.title')}</h4>
        <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAllAsRead}>
          <Check className="mr-2 h-4 w-4" />
          {t('notifications:actions.markAllRead')}
        </Button>
      </div>
      <ScrollArea className="h-[300px]">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </ScrollArea>
    </div>
  );
}
