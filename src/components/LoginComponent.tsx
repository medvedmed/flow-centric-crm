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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-50 to-teal-50 px-4">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 items-center gap-8 bg-white shadow-2xl rounded-xl overflow-hidden">
          <div className="hidden md:block h-full w-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1608127251754-6b9643a096b6?auto=format&fit=crop&w=900&q=80)' }}></div>
          <div className="p-8 md:p-12">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-extrabold text-teal-700 mb-2">Aura Salon CRM</h1>
              <p className="text-gray-500">Login to manage your salon with confidence</p>
            </div>
            <LoginComponent 
              onSuccess={() => navigate('/dashboard')}
              showSignUp={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
