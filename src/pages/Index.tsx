
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Redirect to Landing page for unauthenticated users
  if (!user && !isLoading) {
    navigate('/landing');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Aura Platform
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Professional salon management made simple
        </p>
        <div className="space-y-4">
          <Link to="/landing">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 text-lg">
              Explore Features <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <Link to="/auth" className="text-cyan-400 hover:text-cyan-300 underline">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
