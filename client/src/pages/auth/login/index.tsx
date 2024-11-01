import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

export default function Login() {
  const { t } = useTranslation(['auth']);
  const { login } = useAuth();
  const { toast } = useToast();

  const loginSchema = z.object({
    email: z.string().email(t('auth:login.errors.invalidEmail')),
    password: z.string().min(6, t('auth:login.errors.invalidPassword')),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common:errors.generic'),
        description: error instanceof Error ? error.message : t('auth:login.errors.failed'),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <Logo className="mx-auto" size="lg" />
          <h1 className="mt-6 text-3xl font-bold">{t('auth:login.title')}</h1>
          <p className="text-muted-foreground">{t('auth:login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth:login.email')}</Label>
            <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth:login.password')}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth:login.submitting') : t('auth:login.submit')}
          </Button>
        </form>

        <div className="space-y-4 text-center text-sm">
          <p>
            <Link to="/forgot-password" className="text-primary hover:underline">
              {t('auth:login.forgotPassword')}
            </Link>
          </p>
          <p className="text-muted-foreground">
            {t('auth:login.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline">
              {t('auth:login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
