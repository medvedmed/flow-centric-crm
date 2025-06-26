
import { useAuth } from '@/hooks/useAuth';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { LoginComponent } from './LoginComponent';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isStaff, isLoading: staffLoading } = useStaffAuth();
  const navigate = useNavigate();

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Required
            </h1>
            <p className="text-gray-600">
              Please sign in to access this page
            </p>
          </div>
          <LoginComponent 
            onSuccess={() => navigate('/dashboard')}
            showSignUp={false}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
