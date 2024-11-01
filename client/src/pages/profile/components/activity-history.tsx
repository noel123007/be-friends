import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { GET_USER_ACTIVITIES } from '@/graphql/activity';
import { ActivityItem } from '@/pages/dashboard/components/activity-item';
import type { Activity } from '@/types/activity';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

interface ActivityHistoryProps {
  userId: string;
  limit?: number;
}

interface ActivityConnection {
  edges: Array<{
    node: Activity;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

interface ActivityQueryResult {
  userActivities: ActivityConnection;
}

export function ActivityHistory({ userId, limit = 10 }: ActivityHistoryProps) {
  const { t } = useTranslation(['profile']);
  const {
    data,
    loading,
    error,
    fetchMore: fetchMoreActivities,
  } = useQuery<ActivityQueryResult>(GET_USER_ACTIVITIES, {
    variables: { userId, limit },
  });

  const handleLoadMore = () => {
    if (!data?.userActivities.pageInfo.hasNextPage) return;

    fetchMoreActivities({
      variables: {
        cursor: data.userActivities.pageInfo.endCursor,
      },
      updateQuery: (previousResult: ActivityQueryResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;

        return {
          userActivities: {
            ...fetchMoreResult.userActivities,
            edges: [
              ...previousResult.userActivities.edges,
              ...fetchMoreResult.userActivities.edges,
            ],
          },
        };
      },
    });
  };

  if (error) {
    return (
      <ErrorState
        title={t('profile:errors.activityLoadFailed')}
        message={error.message}
        onRetry={() => fetchMoreActivities({ variables: { userId, limit } })}
      />
    );
  }

  const activities = data?.userActivities.edges.map((edge) => edge.node) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile:activity.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('profile:activity.empty')}
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {data?.userActivities.pageInfo.hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? t('profile:activity.loading') : t('profile:activity.loadMore')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
