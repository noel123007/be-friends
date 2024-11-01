import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation(['common']);

  return (
    <Card>
      <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        {title && <h3 className="mt-4 font-semibold">{title}</h3>}
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t('common:actions.retry')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
