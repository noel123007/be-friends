import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { CREATE_TWEET } from '@/graphql/tweet';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const tweetSchema = z.object({
  content: z.string().min(1).max(280),
});

type TweetInput = z.infer<typeof tweetSchema>;

export function TweetComposer() {
  const { t } = useTranslation(['dashboard']);
  const [createTweet, { loading }] = useMutation(CREATE_TWEET);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TweetInput>({
    resolver: zodResolver(tweetSchema),
  });

  const handleTweetSubmit = async (data: TweetInput) => {
    try {
      await createTweet({
        variables: { input: data },
        refetchQueries: ['GetTweets'],
      });
      reset();
      toast({
        title: t('dashboard:tweet.success'),
        description: t('dashboard:tweet.successDescription'),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('dashboard:tweet.error'),
        description: error instanceof Error ? error.message : t('dashboard:tweet.errorUnknown'),
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleTweetSubmit)}>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">{t('dashboard:tweet.title')}</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('content')}
            placeholder={t('dashboard:tweet.placeholder')}
            className="min-h-[100px] resize-none"
            aria-label={t('dashboard:tweet.ariaLabel')}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? t('dashboard:tweet.posting') : t('dashboard:tweet.post')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
