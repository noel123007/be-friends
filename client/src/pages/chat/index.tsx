import { PageHeader } from '@/components/ui/page-header';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

export function ChatPage() {
  const { t } = useTranslation(['chat']);
  const isTitle = useOutletContext<{ title: boolean }>();

  // If rendered in header, only return the title
  if (isTitle) return t('chat:title');

  return (
    <div className="space-y-6">
      <PageHeader title={t('chat:title')} description={t('chat:description')} />
      {/* Chat content */}
    </div>
  );
}

export default ChatPage;
