import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_ACTIVITIES } from '@/graphql/activity';
import { Activity } from '@/types/activity';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from './activity-item';

export function ActivityFeed() {
  const { t } = useTranslation(['dashboard']);
  const { data, loading } = useQuery(GET_ACTIVITIES, {
    variables: {
      limit: 10,
    },
  });

  const activities = data?.activities?.edges.map((edge: { node: Activity }) => edge.node) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard:activity.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : activities?.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t('dashboard:activity.empty')}
          </p>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity: Activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
