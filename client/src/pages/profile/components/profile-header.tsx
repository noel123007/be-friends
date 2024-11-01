import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UPLOAD_PROFILE_IMAGE } from '@/graphql/profile';
import type { Profile } from '@/types/profile';
import { useMutation } from '@apollo/client';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { t } = useTranslation(['profile']);
  const { toast } = useToast();
  const [uploadImage] = useMutation(UPLOAD_PROFILE_IMAGE);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'cover'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: t('profile:errors.invalidImage'),
        description: t('profile:errors.invalidImageType'),
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: t('profile:errors.imageTooLarge'),
        description: t('profile:errors.imageSizeLimit'),
      });
      return;
    }

    try {
      await uploadImage({
        variables: {
          input: {
            file,
            type,
          },
        },
      });

      toast({
        title: t('profile:success.imageUpload'),
        description: t('profile:success.imageUploadDescription'),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('profile:errors.uploadFailed'),
        description: error instanceof Error ? error.message : t('profile:errors.unknownError'),
      });
    }
  };

  return (
    <div className="relative rounded-lg bg-card">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg md:h-64">
        <img
          src={profile.coverImage || '/images/default-cover.jpg'}
          alt=""
          className="h-full w-full object-cover"
        />
        {isOwnProfile && (
          <label className="absolute bottom-4 right-4 cursor-pointer rounded-full bg-background/80 p-2 transition-colors hover:bg-background">
            <Camera className="h-5 w-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
              aria-label={t('profile:actions.upload.cover')}
            />
          </label>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4 pt-16 md:px-6">
        <div className="absolute -top-16 left-4 md:left-6">
          <div className="relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background">
              <img
                src={profile.avatar || '/images/default-avatar.jpg'}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-background p-2 shadow-lg transition-colors hover:bg-accent">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                  aria-label={t('profile:actions.upload.avatar')}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            {isOwnProfile && (
              <Button variant="outline" size="sm">
                {t('profile:actions.edit')}
              </Button>
            )}
          </div>
          {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <p>{t('profile:stats.friends', { count: profile.stats.friendsCount })}</p>
          <p>{t('profile:stats.posts', { count: profile.stats.postsCount })}</p>
          <p>{t('profile:stats.activities', { count: profile.stats.activitiesCount })}</p>
        </div>
      </div>
    </div>
  );
}
