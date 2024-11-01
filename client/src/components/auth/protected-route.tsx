import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/providers/auth-provider';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
