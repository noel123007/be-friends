import { FriendActionButton } from '@/components/friend-action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import type { Friend } from '@/types/friend';
import { FriendStatus } from '@/types/friend';
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
  const { user: currentUser } = useAuth();
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
        {friends.map((friend) => {
          const friendUser = friend.senderId === currentUser?.id ? friend.receiver : friend.sender;

          return (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={friendUser.avatar} alt={friendUser.name} />
                  <AvatarFallback>{friendUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friendUser.name}</p>
                  <p className="text-sm text-muted-foreground">{friendUser.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <FriendActionButton status={FriendStatus.FRIENDS} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
