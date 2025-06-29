import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginComponent } from '@/components/LoginComponent';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Welcome to Your Salon CRM
        </h1>
        <p className="text-gray-600 text-base mb-6">
          Manage your salon operations with ease
        </p>
        <div className="w-full max-w-md">
          <LoginComponent onSuccess={() => navigate('/dashboard')} />
        </div>
      </div>
    </div>
  );
};

export default Index;
