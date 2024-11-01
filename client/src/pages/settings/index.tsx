import NotificationPreferences from '@/components/notifications/notification-preferences';
import { PageHeader } from '@/components/ui/page-header';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

export function SettingsPage() {
  const { t } = useTranslation(['settings']);
  const isTitle = useOutletContext<{ title: boolean }>();

  // If rendered in header, only return the title
  if (isTitle) return t('settings:title');

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings:title')} description={t('settings:description')} />
      <div className="grid gap-6">
        <NotificationPreferences />
        {/* Other settings sections */}
      </div>
    </div>
  );
}

export default SettingsPage;
