
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import RoleBasedWelcome from '@/components/RoleBasedWelcome';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if this is a first-time login or if we should show welcome
      const tab = searchParams.get('tab');
      const showWelcomeScreen = searchParams.get('welcome') === 'true';
      
      if (showWelcomeScreen || tab === 'welcome') {
        setShowWelcome(true);
      } else {
        // Redirect authenticated users to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, navigate, searchParams]);

  const handleAuthSuccess = () => {
    // Show welcome screen for new users, then redirect to dashboard
    setShowWelcome(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleSkipWelcome = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (user && showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <button 
              onClick={handleSkipWelcome}
              className="text-sm text-muted-foreground hover:text-teal-600 transition-colors"
            >
              Skip intro → Go to Dashboard
            </button>
          </div>
          <RoleBasedWelcome />
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return <AuthForm onAuthSuccess={handleAuthSuccess} />;
};

export default Index;
