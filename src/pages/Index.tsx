
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginComponent } from '@/components/LoginComponent';
import { Loader2, Calendar, Users, BarChart3, CreditCard, Shield, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Show login page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Your Complete Salon CRM Solution
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Streamline your salon operations with our comprehensive management system. 
                From appointment scheduling to client management, financial tracking, and staff coordination - 
                everything you need in one beautiful, intuitive platform.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                  <p className="text-gray-600">Advanced appointment booking with drag-and-drop calendar, automated reminders, and conflict prevention.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Client Management</h3>
                  <p className="text-gray-600">Complete client profiles with visit history, preferences, and automated retention analytics.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Financial Analytics</h3>
                  <p className="text-gray-600">Real-time revenue tracking, expense management, and comprehensive business insights.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Payment Processing</h3>
                  <p className="text-gray-600">Quick payment recording, multiple payment methods, and automated financial transactions.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Role Management</h3>
                  <p className="text-gray-600">Secure access control with customizable roles for owners, managers, staff, and receptionists.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                  <p className="text-gray-600">Live data synchronization, change tracking, and comprehensive audit history.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto px-6 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Get Started Today
            </h2>
            <p className="text-gray-600">
              Sign in to your account or create a new one to start managing your salon
            </p>
          </div>
          <LoginComponent 
            onSuccess={() => navigate('/dashboard')}
            showSignUp={true}
          />
        </div>
      </div>
    );
  }

  // This should not be reached due to the useEffect redirect, but just in case
  return null;
};

export default Index;
