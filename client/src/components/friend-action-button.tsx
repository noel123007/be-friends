import { Button } from '@/components/ui/button';
import { FriendStatus } from '@/types/friend';
import { ButtonVariant } from '@/types/ui';
import { useTranslation } from 'react-i18next';

interface FriendActionButtonProps {
  status?: FriendStatus;
  onAdd?: () => void;
  onClick?: () => Promise<void>;
  loading?: boolean;
  size?: 'default' | 'sm' | 'lg';
  variant?: ButtonVariant;
  label?: string;
}

export function FriendActionButton({
  status,
  onAdd,
  onClick,
  loading,
  size = 'sm',
  variant = 'default',
  label,
}: FriendActionButtonProps) {
  const { t } = useTranslation(['friends']);

  if (onClick && label) {
    return (
      <Button variant={variant} size={size} onClick={onClick} disabled={loading}>
        {loading ? t('friends:actions.loading') : label}
      </Button>
    );
  }

  switch (status) {
    case FriendStatus.PENDING:
      return (
        <Button variant="secondary" size={size} disabled>
          {t('friends:actions.requested')}
        </Button>
      );
    case FriendStatus.FRIENDS:
      return (
        <Button variant="secondary" size={size} disabled>
          {t('friends:actions.friends')}
        </Button>
      );
    case FriendStatus.BLOCKED:
      return (
        <Button variant="secondary" size={size} disabled>
          {t('friends:actions.blocked')}
        </Button>
      );
    case FriendStatus.NONE:
    default:
      if (loading) {
        return (
          <Button size={size} disabled>
            {t('friends:actions.adding')}
          </Button>
        );
      }
      return (
        <Button size={size} onClick={onAdd} aria-label={t('friends:actions.add')}>
          {t('friends:actions.add')}
        </Button>
      );
  }
}
