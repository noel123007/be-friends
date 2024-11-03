import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '@/graphql/friend';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { FriendRequests } from './components/friend-requests';
import { FriendSearch } from './components/friend-search';
import { FriendsList } from './components/friends-list';
import { FriendsSkeleton } from './components/friends-skeleton';

export function FriendsPage() {
  const { t } = useTranslation(['friends']);
  const isTitle = useOutletContext<{ title: boolean }>();

  const {
    data: friendsData,
    loading: friendsLoading,
    error: friendsError,
    refetch: refetchFriends,
  } = useQuery(GET_FRIENDS);

  const {
    data: requestsData,
    loading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery(GET_FRIEND_REQUESTS);

  const handleTabChange = (value: string) => {
    if (value === 'requests') {
      refetchRequests();
      return;
    }

    if (value === 'search') {
      return;
    }

    refetchFriends();
  };

  if (isTitle) return t('friends:title');

  if (friendsLoading || requestsLoading) {
    return <FriendsSkeleton />;
  }

  if (friendsError || requestsError) {
    const errorMessage = (friendsError || requestsError)?.message || t('friends:errors.unknown');
    return (
      <ErrorState
        title={t('friends:errors.loadFailed')}
        message={errorMessage}
        onRetry={() => {
          refetchFriends();
          refetchRequests();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('friends:title')} description={t('friends:description')} />

      <Tabs defaultValue="list" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">{t('friends:tabs.list')}</TabsTrigger>
          <TabsTrigger value="requests">
            {t('friends:tabs.requests')}
            {requestsData?.friendRequests.edges.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {requestsData.friendRequests.edges.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="search">{t('friends:tabs.search')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <FriendsList data={friendsData} />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <FriendRequests data={requestsData} />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <FriendSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FriendsPage;
