import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { FORGOT_PASSWORD } from '@/graphql/auth';
import type { ForgotPasswordInput } from '@/types/auth';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export function ForgotPasswordPage() {
  const { t } = useTranslation(['auth']);
  const { toast } = useToast();
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordInput) => {
    try {
      const response = await forgotPassword({
        variables: { input: data },
      });

      if (response.data?.forgotPassword.success) {
        toast({
          title: t('auth:forgotPassword.success.title'),
          description: t('auth:forgotPassword.success.description'),
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('auth:forgotPassword.error.title'),
        description:
          error instanceof Error ? error.message : t('auth:forgotPassword.error.unknown'),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>{t('auth:forgotPassword.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('auth:forgotPassword.description')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth:forgotPassword.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth:forgotPassword.emailPlaceholder')}
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth:forgotPassword.submitting') : t('auth:forgotPassword.submit')}
            </Button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-primary hover:underline" tabIndex={0}>
                {t('auth:forgotPassword.backToLogin')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
