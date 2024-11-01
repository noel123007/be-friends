import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  [key: string]: unknown;
}

export function ActionButton({ loading, children, ...props }: ActionButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
