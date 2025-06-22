
import { useAuth } from '@/hooks/useAuth';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import AuthForm from './AuthForm';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isStaff, isLoading: staffLoading } = useStaffAuth();

  const isLoading = authLoading || staffLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Allow access if user is logged in OR if it's a staff member
  if (!user && !isStaff) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
