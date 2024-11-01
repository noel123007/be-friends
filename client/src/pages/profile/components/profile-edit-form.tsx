import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { UPDATE_PROFILE } from '@/graphql/profile';
import type { Profile } from '@/types/profile';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { SocialLinksForm } from './social-links-form';

interface ProfileEditFormProps {
  profile: Profile;
  onCancel: () => void;
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  }),
});

export function ProfileEditForm({ profile, onCancel }: ProfileEditFormProps) {
  const { t } = useTranslation(['profile']);
  const { toast } = useToast();
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.socialLinks,
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile({
        variables: { input: data },
        optimisticResponse: {
          updateProfile: {
            ...profile,
            ...data,
          },
        },
      });

      toast({
        title: t('profile:success.update'),
        description: t('profile:success.updateDescription'),
      });
      onCancel();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('profile:errors.updateFailed'),
        description: error instanceof Error ? error.message : t('profile:errors.unknownError'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile:edit.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile:edit.name')}</Label>
            <Input
              id="name"
              {...register('name')}
              defaultValue={profile.name}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t('profile:edit.bio')}</Label>
            <Textarea id="bio" {...register('bio')} defaultValue={profile.bio} className="h-32" />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('profile:edit.location')}</Label>
            <Input id="location" {...register('location')} defaultValue={profile.location} />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">{t('profile:edit.website')}</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              defaultValue={profile.website}
            />
            {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
          </div>

          <SocialLinksForm socialLinks={profile.socialLinks} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('profile:actions.cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('profile:actions.saving') : t('profile:actions.save')}
        </Button>
      </div>
    </form>
  );
}
