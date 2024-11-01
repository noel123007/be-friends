import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AuthProvider } from '@/providers/auth-provider';
import { NotificationProvider } from '@/providers/notification-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/protected-route';

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/login'));
const RegisterPage = lazy(() => import('@/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'));

// Main pages
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const FriendsPage = lazy(() => import('@/pages/friends'));
const ChatPage = lazy(() => import('@/pages/chat'));
const SettingsPage = lazy(() => import('@/pages/settings'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/friends" element={<FriendsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
