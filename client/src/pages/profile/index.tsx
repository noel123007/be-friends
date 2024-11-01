import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { GET_PROFILE } from '@/graphql/profile';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { ActivityHistory } from './components/activity-history';
import { ProfileEditForm } from './components/profile-edit-form';
import { ProfileHeader } from './components/profile-header';
import { ProfileInfo } from './components/profile-info';
import { ProfileSkeleton } from './components/profile-skeleton';

export function ProfilePage() {
  const { t } = useTranslation(['profile']);
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isTitle = useOutletContext<{ title: boolean }>();

  const { data, loading, error, refetch } = useQuery(GET_PROFILE, {
    variables: { userId: userId || currentUser?.id },
  });

  if (isTitle) return t('profile:title');

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <ErrorState
        title={t('profile:errors.loadFailed')}
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  const profile = data?.profile;
  if (!profile) {
    return (
      <ErrorState
        title={t('profile:errors.notFound')}
        message={t('profile:errors.notFoundDescription')}
      />
    );
  }

  const isOwnProfile = profile.userId === currentUser?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwnProfile ? t('profile:title') : profile.name}
        description={isOwnProfile ? t('profile:description') : undefined}
      />

      <div className="grid gap-6">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {isEditing ? (
              <ProfileEditForm profile={profile} onCancel={() => setIsEditing(false)} />
            ) : (
              <ProfileInfo
                profile={profile}
                isOwnProfile={isOwnProfile}
                onEdit={() => setIsEditing(true)}
              />
            )}
            <ActivityHistory userId={profile.userId} />
          </div>

          <div className="space-y-6">{/* Additional profile sections */}</div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
