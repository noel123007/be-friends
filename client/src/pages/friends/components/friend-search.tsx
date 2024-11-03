import { FriendActionButton } from '@/components/friend-action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { SEARCH_USERS, SEND_FRIEND_REQUEST } from '@/graphql/friend';
import { debounce } from '@/lib/utils';
import { User } from '@/types/auth';
import { SearchUserResult } from '@/types/friend';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function FriendSearch() {
  const { t } = useTranslation(['friends']);
  const [query, setQuery] = useState('');
  const [search, { data, loading, error }] = useLazyQuery(SEARCH_USERS);
  const [sendFriendRequest, { loading: sending }] = useMutation(SEND_FRIEND_REQUEST);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        search({ variables: { query: searchQuery } });
      }
    }, 300),
    [search]
  );

  useEffect(() => {
    debouncedSearch(query);

    return () => {
      debouncedSearch.cancel?.();
    };
  }, [query, debouncedSearch]);

  const handleAddFriend = async (userId: string) => {
    try {
      await sendFriendRequest({
        variables: { userId },
        update: (cache, { data: mutationData }) => {
          if (!mutationData) return;

          const existingData = cache.readQuery<{ searchUsers: User[] }>({
            query: SEARCH_USERS,
            variables: { query },
          });

          if (!existingData) return;

          cache.writeQuery({
            query: SEARCH_USERS,
            variables: { query },
            data: {
              searchUsers: existingData.searchUsers.map((user) => {
                return user.id === userId ? { ...user, friendStatus: 'PENDING' } : user;
              }),
            },
          });
        },
      });
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  if (error) {
    return (
      <ErrorState
        title={t('friends:errors.searchFailed')}
        message={error.message}
        onRetry={() => search({ variables: { query } })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('friends:search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : data?.searchUsers.length === 0 && query ? (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">{t('friends:search.noResults')}</p>
          </CardContent>
        </Card>
      ) : data?.searchUsers ? (
        <Card>
          <CardContent className="space-y-4 py-6">
            {data.searchUsers.map((user: SearchUserResult) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <FriendActionButton
                  status={user.friendStatus}
                  onAdd={() => handleAddFriend(user.id)}
                  loading={sending}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
