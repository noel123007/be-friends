import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile } from '@/types/profile';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Globe, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileInfoProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEdit: () => void;
}

export function ProfileInfo({ profile, isOwnProfile, onEdit }: ProfileInfoProps) {
  const { t } = useTranslation(['profile']);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('profile:info.title')}</CardTitle>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            {t('profile:actions.edit')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{t('profile:info.bio')}</h4>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {profile.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{profile.location}</span>
          </div>
        )}

        {profile.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {profile.website}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {t('profile:info.joined', {
              date: formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true }),
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
