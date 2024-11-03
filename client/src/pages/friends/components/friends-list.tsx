import { FriendActionButton } from '@/components/friend-action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { GET_FRIENDS, REMOVE_FRIEND } from '@/graphql/friend';
import { useAuth } from '@/providers/auth-provider';
import type { Friend } from '@/types/friend';
import { FriendStatus } from '@/types/friend';
import { useMutation } from '@apollo/client';
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

  const [removeFriend, { loading: removing }] = useMutation(REMOVE_FRIEND, {
    refetchQueries: [{ query: GET_FRIENDS }],
    onError: (error) => {
      toast({
        title: t('friends:errors.removeFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend({ variables: { friendId } });
      toast({
        title: t('friends:success.removed'),
        description: t('friends:success.removedDescription'),
      });
    } catch (error) {
      // Error handled by mutation error callback
      console.error(error);
    }
  };

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
              className="flex flex-col items-start justify-between space-y-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:space-y-0"
            >
              <div className="flex w-full items-center gap-4 sm:w-auto">
                <Avatar>
                  <AvatarImage src={friendUser.avatar} alt={friendUser.name} />
                  <AvatarFallback>{friendUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{friendUser.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{friendUser.email}</p>
                </div>
              </div>
              <div className="flex w-full justify-end sm:w-auto">
                <FriendActionButton
                  status={FriendStatus.FRIENDS}
                  onClick={() => handleRemoveFriend(friend.id)}
                  loading={removing}
                  label={t('friends:actions.remove')}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
