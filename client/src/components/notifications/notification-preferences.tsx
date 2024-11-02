import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  GET_NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATION_PREFERENCES,
} from '@/graphql/notification';
import type { NotificationPreferences } from '@/types/notification';
import { useMutation, useQuery } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationPreferences() {
  const { t } = useTranslation(['notifications']);
  const { toast } = useToast();
  const { data, loading, refetch } = useQuery(GET_NOTIFICATION_PREFERENCES);
  const [updatePreferences, { loading: updating }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await updatePreferences({
        variables: {
          input: {
            ...data?.notificationPreferences,
            [key]: value,
          },
        },
      });
      refetch();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('notifications:preferences.errors.updateFailed'),
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const preferences = data?.notificationPreferences;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notifications:preferences.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="friendRequests" className="flex flex-col space-y-1">
              <span>{t('notifications:preferences.friendRequests.title')}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {t('notifications:preferences.friendRequests.description')}
              </span>
            </Label>
            <Switch
              id="friendRequests"
              checked={preferences?.friendRequests}
              onCheckedChange={(checked: boolean) =>
                handlePreferenceChange('friendRequests', checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="system" className="flex flex-col space-y-1">
              <span>{t('notifications:preferences.system.title')}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {t('notifications:preferences.system.description')}
              </span>
            </Label>
            <Switch
              id="system"
              checked={preferences?.system}
              onCheckedChange={(checked: boolean) => handlePreferenceChange('system', checked)}
              disabled={updating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
