import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ACCEPT_FRIEND_REQUEST,
  BLOCK_USER,
  REJECT_FRIEND_REQUEST,
  SEND_FRIEND_REQUEST,
  UNBLOCK_USER,
} from '@/graphql/friend';
import type { FriendStatus, SearchUserResult } from '@/types/friend';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: SearchUserResult;
}

export function UserCard({ user }: UserCardProps) {
  const { t } = useTranslation(['friends']);
  const [sendRequest] = useMutation(SEND_FRIEND_REQUEST);
  const [acceptRequest] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [rejectRequest] = useMutation(REJECT_FRIEND_REQUEST);
  const [blockUser] = useMutation(BLOCK_USER);
  const [unblockUser] = useMutation(UNBLOCK_USER);

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'send':
          await sendRequest({ variables: { userId: user.id } });
          break;
        case 'accept':
          await acceptRequest({ variables: { userId: user.id } });
          break;
        case 'reject':
          await rejectRequest({ variables: { userId: user.id } });
          break;
        case 'block':
          await blockUser({ variables: { userId: user.id } });
          break;
        case 'unblock':
          await unblockUser({ variables: { userId: user.id } });
          break;
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const renderActionButton = (status?: FriendStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="space-x-2">
            <Button size="sm" onClick={() => handleAction('accept')}>
              {t('friends:actions.accept')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('reject')}>
              {t('friends:actions.reject')}
            </Button>
          </div>
        );
      case 'BLOCKED':
        return (
          <Button size="sm" variant="outline" onClick={() => handleAction('unblock')}>
            {t('friends:actions.unblock')}
          </Button>
        );
      case 'ACCEPTED':
        return (
          <Button size="sm" variant="outline" onClick={() => handleAction('block')}>
            {t('friends:actions.block')}
          </Button>
        );
      default:
        return (
          <Button size="sm" onClick={() => handleAction('send')}>
            {t('friends:actions.add')}
          </Button>
        );
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      {renderActionButton(user.friendStatus)}
    </div>
  );
}
