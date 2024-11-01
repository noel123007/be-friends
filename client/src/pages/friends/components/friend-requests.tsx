import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FriendRequest } from '@/types/friend';
import { useTranslation } from 'react-i18next';

interface FriendRequestsProps {
  data: {
    friendRequests: {
      edges: Array<{
        node: FriendRequest;
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

export function FriendRequests({ data }: FriendRequestsProps) {
  const { t } = useTranslation(['friends']);
  const requests = data?.friendRequests.edges.map((edge) => edge.node) || [];

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('friends:requests.empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('friends:requests.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={request.sender.avatar} alt={request.sender.name} />
                <AvatarFallback>{request.sender.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{request.sender.name}</p>
                <p className="text-sm text-muted-foreground">{request.sender.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm">{t('friends:actions.accept')}</Button>
              <Button variant="outline" size="sm">
                {t('friends:actions.decline')}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
