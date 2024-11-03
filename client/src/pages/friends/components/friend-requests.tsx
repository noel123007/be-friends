/* eslint-disable @typescript-eslint/no-unused-vars */
import { FriendActionButton } from '@/components/friend-action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  ACCEPT_FRIEND_REQUEST,
  GET_FRIEND_REQUESTS,
  GET_SENT_REQUESTS,
  REJECT_FRIEND_REQUEST,
  UNSEND_FRIEND_REQUEST,
} from '@/graphql/friend';
import type { FriendRequest } from '@/types/friend';
import { useMutation, useQuery } from '@apollo/client';
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

const ReceivedRequests = ({
  requests,
  onAccept,
  onReject,
  accepting,
  rejecting,
}: {
  requests: FriendRequest[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  accepting: boolean;
  rejecting: boolean;
}) => {
  const { t } = useTranslation(['friends']);

  if (requests.length === 0)
    return (
      <p className="py-4 text-center text-muted-foreground">{t('friends:requests.noReceived')}</p>
    );

  return (
    <div className="space-y-4">
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
              onClick={() => onAccept(request.id)}
              loading={accepting}
              label={t('friends:actions.accept')}
            />
            <FriendActionButton
              variant="outline"
              onClick={() => onReject(request.id)}
              loading={rejecting}
              label={t('friends:actions.reject')}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const SentRequests = ({
  requests,
  onUnsend,
  unsending,
}: {
  requests: FriendRequest[];
  onUnsend: (id: string) => Promise<void>;
  unsending: boolean;
}) => {
  const { t } = useTranslation(['friends']);

  if (requests.length === 0)
    return <p className="py-4 text-center text-muted-foreground">{t('friends:requests.noSent')}</p>;

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={request.receiver.avatar} alt={request.receiver.name} />
              <AvatarFallback>{request.receiver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{request.receiver.name}</p>
              <p className="text-sm text-muted-foreground">{request.receiver.email}</p>
            </div>
          </div>
          <FriendActionButton
            variant="outline"
            onClick={() => onUnsend(request.id)}
            loading={unsending}
            label={t('friends:actions.unsend')}
          />
        </div>
      ))}
    </div>
  );
};

export function FriendRequests({ data }: FriendRequestsProps) {
  const { t } = useTranslation(['friends']);
  const receivedRequests = data?.friendRequests.edges.map((edge) => edge.node) || [];

  const { data: sentData, refetch: refetchSentRequests } = useQuery(GET_SENT_REQUESTS);
  const sentRequests =
    sentData?.sentRequests.edges.map((edge: { node: FriendRequest }) => edge.node) || [];

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

  const [unsendRequest, { loading: unsending }] = useMutation(UNSEND_FRIEND_REQUEST, {
    refetchQueries: [{ query: GET_SENT_REQUESTS }],
    onError: (error) => {
      toast({
        title: t('friends:errors.unsendFailed'),
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

  const handleUnsend = async (requestId: string) => {
    try {
      await unsendRequest({ variables: { requestId } });
      toast({
        title: t('friends:success.unsent'),
        description: t('friends:success.unsentDescription'),
      });
    } catch (error) {
      // Error handled by mutation error callback
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'sent') {
      refetchSentRequests();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('friends:requests.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">{t('friends:requests.received')}</TabsTrigger>
            <TabsTrigger value="sent">{t('friends:requests.sent')}</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <ReceivedRequests
              requests={receivedRequests}
              onAccept={handleAccept}
              onReject={handleReject}
              accepting={accepting}
              rejecting={rejecting}
            />
          </TabsContent>

          <TabsContent value="sent">
            <SentRequests requests={sentRequests} onUnsend={handleUnsend} unsending={unsending} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
