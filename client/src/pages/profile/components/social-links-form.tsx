import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SocialLinksFormProps {
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export function SocialLinksForm({ socialLinks }: SocialLinksFormProps) {
  const { t } = useTranslation(['profile']);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{t('profile:social.title')}</h3>

      <div className="space-y-4">
        {/* Twitter */}
        <div className="space-y-2">
          <Label htmlFor="twitter" className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            {t('profile:social.twitter')}
          </Label>
          <Input
            id="twitter"
            name="twitter"
            type="url"
            placeholder="https://twitter.com/username"
            defaultValue={socialLinks?.twitter}
          />
        </div>

        {/* GitHub */}
        <div className="space-y-2">
          <Label htmlFor="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            {t('profile:social.github')}
          </Label>
          <Input
            id="github"
            name="github"
            type="url"
            placeholder="https://github.com/username"
            defaultValue={socialLinks?.github}
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            {t('profile:social.linkedin')}
          </Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/username"
            defaultValue={socialLinks?.linkedin}
          />
        </div>
      </div>
    </div>
  );
}
