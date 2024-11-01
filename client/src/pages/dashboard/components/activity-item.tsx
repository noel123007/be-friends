import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Activity } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { t } = useTranslation(['dashboard']);

  const getActivityMessage = (activity: Activity) => {
    const baseMessage = t(`dashboard:activity.types.${activity.type}`);
    return activity.message || baseMessage;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getActivityLink = (activity: Activity) => {
    switch (activity.type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        return `/profile/${activity.data?.friendId}`;
      case 'POST_CREATED':
      case 'COMMENT_ADDED':
        return `/posts/${activity.data?.postId}`;
      default:
        return `/profile/${activity.user.id}`;
    }
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <Link to={`/profile/${activity.user.id}`} className="font-medium hover:underline">
            {activity.user.name}
          </Link>{' '}
          {getActivityMessage(activity)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}