import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_FRIENDS } from '@/graphql/friend';
import { useAuth } from '@/providers/auth-provider';
import { Friend } from '@/types/friend';
import { useQuery } from '@apollo/client';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function FriendsPreview() {
  const { t } = useTranslation(['dashboard']);
  const { user: currentUser } = useAuth();
  const { data, loading } = useQuery(GET_FRIENDS, {
    variables: { limit: 5 },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{t('dashboard:friends.title')}</CardTitle>
        <Link to="/friends">
          <Button variant="ghost" size="sm">
            {t('dashboard:friends.viewAll')}
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : data?.friends.edges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">{t('dashboard:friends.empty')}</p>
            <Button asChild variant="link" className="mt-4">
              <Link to="/friends">{t('dashboard:friends.find')}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.friends.edges.map(({ node: friend }: { node: Friend }) => {
              const friendUser =
                friend.senderId === currentUser?.id ? friend.receiver : friend.sender;

              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                >
                  <Link to={`/profile/${friendUser.id}`} className="flex flex-1 items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friendUser.avatar} alt={friendUser.name} />
                      <AvatarFallback>{friendUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{friendUser.name}</p>
                      <p className="text-sm text-muted-foreground">{friendUser.email}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
