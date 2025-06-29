
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginComponent } from '@/components/LoginComponent';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show login page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Salon CRM
            </h1>
            <p className="text-gray-600">
              Manage your salon operations with ease
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

  // This should not be reached due to the useEffect redirect, but just in case
  return null;
};

export default Index;
