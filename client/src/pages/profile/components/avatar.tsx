import { UPLOAD_AVATAR } from '@/graphql/profile';
import type { Profile } from '@/types/profile';
import { useMutation } from '@apollo/client';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AvatarProps {
  profile: Profile;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'h-8 w-8',
  medium: 'h-12 w-12',
  large: 'h-24 w-24 md:h-32 md:w-32',
};

export function Avatar({ profile, size = 'medium' }: AvatarProps) {
  const { t } = useTranslation(['profile']);
  const [uploadAvatar] = useMutation(UPLOAD_AVATAR);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar({
        variables: { file },
        update: (cache, { data }) => {
          cache.modify({
            id: cache.identify({ __typename: 'Profile', id: profile.id }),
            fields: {
              avatar: () => data.uploadAvatar.url,
            },
          });
        },
      });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} overflow-hidden rounded-full bg-muted`}>
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <span className="text-xl font-medium text-primary">{getInitial(profile.name)}</span>
          </div>
        )}
      </div>
      {size === 'large' && (
        <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-background p-2 shadow-lg transition-colors hover:bg-accent">
          <Camera className="h-4 w-4" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
            aria-label={t('profile:actions.changeAvatar')}
          />
        </label>
      )}
    </div>
  );
}
