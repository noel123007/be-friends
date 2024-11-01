import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { UPDATE_PROFILE } from '@/graphql/profile';
import type { Profile, UpdateProfileInput } from '@/types/profile';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { t } = useTranslation(['profile']);
  const { toast } = useToast();
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const profileSchema = z.object({
    bio: z.string().max(500, t('profile:form.bio.error.tooLong')).optional(),
    location: z.string().max(100, t('profile:form.location.error.tooLong')).optional(),
    website: z
      .string()
      .url(t('profile:form.website.error.invalid'))
      .max(100, t('profile:form.website.error.tooLong'))
      .optional()
      .or(z.literal('')),
    socialLinks: z.object({
      twitter: z
        .string()
        .url(t('profile:form.socialLinks.error.invalid'))
        .max(100, t('profile:form.socialLinks.error.tooLong'))
        .optional()
        .or(z.literal('')),
      github: z
        .string()
        .url(t('profile:form.socialLinks.error.invalid'))
        .max(100, t('profile:form.socialLinks.error.tooLong'))
        .optional()
        .or(z.literal('')),
      linkedin: z
        .string()
        .url(t('profile:form.socialLinks.error.invalid'))
        .max(100, t('profile:form.socialLinks.error.tooLong'))
        .optional()
        .or(z.literal('')),
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.socialLinks,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      await updateProfile({
        variables: { input: data },
        update: (cache, { data: updatedData }) => {
          cache.modify({
            id: cache.identify({ __typename: 'Profile', id: profile.id }),
            fields: {
              bio: () => updatedData.updateProfile.bio,
              location: () => updatedData.updateProfile.location,
              website: () => updatedData.updateProfile.website,
              socialLinks: () => updatedData.updateProfile.socialLinks,
            },
          });
        },
      });

      toast({
        title: t('profile:form.success.title'),
        description: t('profile:form.success.description'),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common:errors.generic'),
        description: error instanceof Error ? error.message : t('profile:form.errors.failed'),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Bio Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">{t('profile:form.bio.label')}</Label>
          <Textarea
            id="bio"
            placeholder={t('profile:form.bio.placeholder')}
            {...register('bio')}
            className="h-32"
          />
          {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">{t('profile:form.location.label')}</Label>
          <Input
            id="location"
            placeholder={t('profile:form.location.placeholder')}
            {...register('location')}
          />
          {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">{t('profile:form.website.label')}</Label>
          <Input
            id="website"
            type="url"
            placeholder={t('profile:form.website.placeholder')}
            {...register('website')}
          />
          {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('profile:form.socialLinks.title')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Twitter */}
          <div className="space-y-2">
            <Label htmlFor="twitter">{t('profile:form.socialLinks.twitter')}</Label>
            <Input
              id="twitter"
              type="url"
              placeholder="https://twitter.com/username"
              {...register('socialLinks.twitter')}
            />
            {errors.socialLinks?.twitter && (
              <p className="text-sm text-destructive">{errors.socialLinks.twitter.message}</p>
            )}
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label htmlFor="github">{t('profile:form.socialLinks.github')}</Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/username"
              {...register('socialLinks.github')}
            />
            {errors.socialLinks?.github && (
              <p className="text-sm text-destructive">{errors.socialLinks.github.message}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">{t('profile:form.socialLinks.linkedin')}</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              {...register('socialLinks.linkedin')}
            />
            {errors.socialLinks?.linkedin && (
              <p className="text-sm text-destructive">{errors.socialLinks.linkedin.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full md:w-auto">
        {isSubmitting ? t('profile:form.submitting') : t('profile:form.submit')}
      </Button>
    </form>
  );
}
