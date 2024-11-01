import { PageHeader } from '@/components/ui/page-header';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { ActivityFeed } from './components/activity-feed';
import { FriendsPreview } from './components/friends-preview';
import { WelcomeSection } from './components/welcome-section';

export function DashboardPage() {
  const { t } = useTranslation(['dashboard']);
  const isTitle = useOutletContext<{ title: boolean }>();

  if (isTitle) return t('dashboard:title');

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard:title')} description={t('dashboard:description')} />

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content - 5 columns */}
        <div className="space-y-6 lg:col-span-5">
          <WelcomeSection />
          <ActivityFeed />
        </div>

        {/* Sidebar - 2 columns */}
        <div className="lg:col-span-2">
          <FriendsPreview />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
