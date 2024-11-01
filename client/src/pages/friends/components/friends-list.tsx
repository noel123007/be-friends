import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Friend } from '@/types/friend';
import { useTranslation } from 'react-i18next';

interface FriendsListProps {
  data: {
    friends: {
      edges: Array<{
        node: Friend;
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

export function FriendsList({ data }: FriendsListProps) {
  const { t } = useTranslation(['friends']);
  const friends = data?.friends.edges.map((edge) => edge.node) || [];

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('friends:list.empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('friends:list.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={friend.user.avatar} alt={friend.user.name} />
                <AvatarFallback>{friend.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{friend.user.name}</p>
                <p className="text-sm text-muted-foreground">{friend.user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {t('friends:actions.message')}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
