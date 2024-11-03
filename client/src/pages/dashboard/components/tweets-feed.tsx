import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { GET_TWEETS, LIKE_TWEET, UNLIKE_TWEET } from '@/graphql/tweet';
import { useMutation, useQuery } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Tweet {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export function TweetsFeed() {
  const { t } = useTranslation(['dashboard']);
  const { data, loading, fetchMore } = useQuery(GET_TWEETS, {
    variables: { limit: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const [likeTweet] = useMutation(LIKE_TWEET);
  const [unlikeTweet] = useMutation(UNLIKE_TWEET);

  const handleLikeToggle = async (tweetId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeTweet({
          variables: { id: tweetId },
          refetchQueries: ['GetTweets'],
        });
      } else {
        await likeTweet({
          variables: { id: tweetId },
          refetchQueries: ['GetTweets'],
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('dashboard:tweets.likeError'),
        description:
          error instanceof Error ? error.message : t('dashboard:tweets.likeErrorUnknown'),
      });
    }
  };

  const handleLoadMore = () => {
    if (!data?.tweets.pageInfo.hasNextPage) return;

    fetchMore({
      variables: {
        cursor: data.tweets.pageInfo.endCursor,
        limit: 10,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          tweets: {
            ...fetchMoreResult.tweets,
            edges: [...prev.tweets.edges, ...fetchMoreResult.tweets.edges],
          },
        };
      },
    });
  };

  if (loading && !data) {
    return <TweetsFeedSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard:tweets.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {data?.tweets.edges.map(({ node: tweet }: { node: Tweet }) => (
              <Card key={tweet.id} className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
                    <AvatarFallback>{tweet.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{tweet.author.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{tweet.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleLikeToggle(tweet.id, tweet.isLiked)}
                    >
                      <Heart
                        className={tweet.isLiked ? 'fill-current text-red-500' : ''}
                        size={16}
                      />
                      {tweet.likes}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {data?.tweets.pageInfo.hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? t('dashboard:tweets.loading') : t('dashboard:tweets.loadMore')}
              </Button>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TweetsFeedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
