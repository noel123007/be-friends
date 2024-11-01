import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

export function WelcomeSection() {
  const { t } = useTranslation(['dashboard']);
  const { user } = useAuth();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {t('dashboard:welcome.greeting', { name: user?.name })}
          </h2>
          {user?.lastLoginAt && (
            <p className="text-sm text-muted-foreground">
              {t('dashboard:welcome.lastLogin', {
                time: formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }),
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
