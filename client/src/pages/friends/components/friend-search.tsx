import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { SEARCH_USERS } from '@/graphql/friend';
import { debounce } from '@/lib/utils';
import { User } from '@/types/auth';
import { useLazyQuery } from '@apollo/client';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function FriendSearch() {
  const { t } = useTranslation(['friends']);
  const [query, setQuery] = useState('');
  const [search, { data, loading, error }] = useLazyQuery(SEARCH_USERS);

  const debouncedSearch = debounce((searchQuery: string) => {
    if (searchQuery.trim()) {
      search({ variables: { query: searchQuery } });
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

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
            {data.searchUsers.map((user: User) => (
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
                <Button size="sm">{t('friends:actions.add')}</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
