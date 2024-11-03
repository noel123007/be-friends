import { LanguageSwitcher } from '@/components/language/language-switcher';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { NavigationMenu } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { Home, Menu, MessageSquare, Settings, User, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';

export function DashboardLayout() {
  const { t } = useTranslation(['dashboard']);
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: t('dashboard:navigation.dashboard'), href: '/' },
    { icon: User, label: t('dashboard:navigation.profile'), href: '/profile' },
    { icon: Users, label: t('dashboard:navigation.friends'), href: '/friends' },
    { icon: MessageSquare, label: t('dashboard:navigation.chat'), href: '/chat' },
    { icon: Settings, label: t('dashboard:navigation.settings'), href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header - Mobile */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? t('dashboard:menu.close') : t('dashboard:menu.open')}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section - Desktop */}
          <div className="hidden border-b p-4 lg:block">
            <Logo />
          </div>

          {/* Navigation */}
          <NavigationMenu className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href} onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
                  <Link
                    to={item.href}
                    className="flex items-center rounded-lg px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </NavigationMenu>

          {/* Logout Button */}
          <div className="border-t p-4">
            <Button onClick={logout} variant="outline" className="w-full">
              {t('dashboard:actions.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Top Header - Desktop */}
      <header className="fixed right-0 top-0 z-30 hidden h-16 w-[calc(100%-16rem)] lg:block">
        <div className="flex h-full items-center justify-between bg-background px-6">
          <h1 className="text-xl font-semibold">
            <Outlet context={{ title: true }} />
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn('min-h-screen transition-all duration-200 ease-in-out', 'pt-16 lg:ml-64')}
      >
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
