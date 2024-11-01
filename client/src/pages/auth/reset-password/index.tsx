import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { RESET_PASSWORD, VALIDATE_RESET_TOKEN } from '@/graphql/auth';
import type { ResetPasswordInput } from '@/types/auth';
import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'auth:resetPassword.validation.password.minLength')
      .max(50, 'auth:resetPassword.validation.password.maxLength')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'auth:resetPassword.validation.password.pattern'),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth:resetPassword.validation.confirmPassword.match',
    path: ['confirmPassword'],
  });

export function ResetPasswordPage() {
  const { t } = useTranslation(['auth']);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Validate token
  const { loading: validating } = useQuery(VALIDATE_RESET_TOKEN, {
    variables: { token },
    skip: !token,
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('auth:resetPassword.error.invalidToken'),
        description: error.message || t('auth:resetPassword.error.invalidTokenDescription'),
      });
      navigate('/forgot-password', { replace: true });
    },
  });

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('auth:resetPassword.error.title'),
        description: error.message || t('auth:resetPassword.error.unknown'),
      });
    },
    onCompleted: () => {
      toast({
        title: t('auth:resetPassword.success.title'),
        description: t('auth:resetPassword.success.description'),
      });
      navigate('/login', { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  });

  const handleResetPassword = async (data: ResetPasswordInput) => {
    try {
      const response = await resetPassword({
        variables: { input: data },
      });

      if (response.data?.resetPassword.success) {
        toast({
          title: t('auth:resetPassword.success.title'),
          description: t('auth:resetPassword.success.description'),
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('auth:resetPassword.error.title'),
        description: error instanceof Error ? error.message : t('auth:resetPassword.error.unknown'),
      });
    }
  };

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t('auth:resetPassword.validating')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6 text-center">
            <p className="text-muted-foreground">{t('auth:resetPassword.error.noToken')}</p>
            <Button asChild>
              <Link to="/forgot-password">{t('auth:resetPassword.requestNewLink')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>{t('auth:resetPassword.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('auth:resetPassword.description')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
            <input type="hidden" {...register('token')} />

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth:resetPassword.password')}</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth:resetPassword.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth:resetPassword.submitting') : t('auth:resetPassword.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;
