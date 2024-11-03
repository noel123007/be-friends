import { PageHeader } from '@/components/ui/page-header';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { ActivityFeed } from './components/activity-feed';
import { FriendsPreview } from './components/friends-preview';
import { TweetComposer } from './components/tweet-composer';
import { TweetsFeed } from './components/tweets-feed';
import { WelcomeSection } from './components/welcome-section';

export function DashboardPage() {
  const { t } = useTranslation(['dashboard']);
  const isTitle = useOutletContext<{ title: boolean }>();

  if (isTitle) return t('dashboard:title');

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard:title')} description={t('dashboard:description')} />

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content - 5 columns on desktop */}
        <div className="space-y-6 lg:col-span-5">
          {/* Welcome Section - Only visible on mobile */}
          <div className="lg:hidden">
            <WelcomeSection />
          </div>

          <TweetComposer />
          <TweetsFeed />
        </div>

        {/* Sidebar - 2 columns on desktop, hidden on mobile */}
        <div className="hidden space-y-6 lg:col-span-2 lg:block">
          <WelcomeSection />
          <FriendsPreview />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
