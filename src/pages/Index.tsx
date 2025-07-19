
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStaffAuth } from '@/hooks/useStaffAuth';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isStaff, isLoading: staffLoading } = useStaffAuth();

  useEffect(() => {
    if (authLoading || staffLoading) return;

    // Check if user is authenticated as regular user
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Check if user is authenticated as staff
    if (isStaff) {
      navigate('/staff-portal');
      return;
    }

    // If neither, redirect to landing page
    navigate('/landing');
  }, [isAuthenticated, isStaff, authLoading, staffLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  );
};

export default Index;
