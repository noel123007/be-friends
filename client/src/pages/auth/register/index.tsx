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

export default function Register() {
  const { t } = useTranslation(['auth']);
  const { register: registerUser } = useAuth();
  const { toast } = useToast();

  const registerSchema = z
    .object({
      name: z.string().min(2, t('auth:register.errors.nameTooShort')),
      email: z.string().email(t('auth:register.errors.invalidEmail')),
      password: z.string().min(6, t('auth:register.errors.passwordTooShort')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth:register.errors.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

  type RegisterForm = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerInput } = data;
      await registerUser(registerInput);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common:errors.generic'),
        description: error instanceof Error ? error.message : t('auth:register.errors.failed'),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <Logo className="mx-auto" size="lg" />
          <h1 className="mt-6 text-3xl font-bold">{t('auth:register.title')}</h1>
          <p className="text-muted-foreground">{t('auth:register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth:register.name')}</Label>
            <Input id="name" placeholder="John Doe" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth:register.email')}</Label>
            <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth:register.password')}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth:register.confirmPassword')}</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth:register.submitting') : t('auth:register.submit')}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            {t('auth:register.haveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('auth:register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
