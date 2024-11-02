/* eslint-disable @typescript-eslint/no-unused-vars */
import { FriendActionButton } from '@/components/friend-action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import {
  ACCEPT_FRIEND_REQUEST,
  GET_FRIEND_REQUESTS,
  REJECT_FRIEND_REQUEST,
} from '@/graphql/friend';
import type { FriendRequest } from '@/types/friend';
import { useMutation } from '@apollo/client';
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

  const [acceptRequest, { loading: accepting }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    refetchQueries: [{ query: GET_FRIEND_REQUESTS }],
    onError: (error) => {
      toast({
        title: t('friends:errors.acceptFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [rejectRequest, { loading: rejecting }] = useMutation(REJECT_FRIEND_REQUEST, {
    refetchQueries: [{ query: GET_FRIEND_REQUESTS }],
    onError: (error) => {
      toast({
        title: t('friends:errors.rejectFailed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest({ variables: { requestId } });
      toast({
        title: t('friends:success.accepted'),
        description: t('friends:success.acceptedDescription'),
      });
    } catch (error) {
      // Error handled by mutation error callback
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest({ variables: { requestId } });
      toast({
        title: t('friends:success.rejected'),
        description: t('friends:success.rejectedDescription'),
      });
    } catch (error) {
      // Error handled by mutation error callback
    }
  };

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
              <FriendActionButton
                variant="default"
                onClick={() => handleAccept(request.id)}
                loading={accepting}
                label={t('friends:actions.accept')}
              />
              <FriendActionButton
                variant="outline"
                onClick={() => handleReject(request.id)}
                loading={rejecting}
                label={t('friends:actions.reject')}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
