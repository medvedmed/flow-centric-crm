import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Scissors, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [staffLoginForm, setStaffLoginForm] = useState({ staffId: '', staffPassword: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    fullName: '',
    salonName: ''
  });
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });
      if (error) throw error;
      toast({ title: 'Success', description: 'Logged in successfully!' });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to login',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('authenticate_staff', {
        login_id: staffLoginForm.staffId,
        login_password: staffLoginForm.staffPassword
      });
      if (error) throw error;
      if (!data || data.length === 0 || !data[0].is_valid) {
        throw new Error('Invalid staff ID or password.');
      }
      localStorage.setItem(
        'staff_session',
        JSON.stringify({
          staffId: data[0].staff_id,
          staffName: data[0].staff_name,
          staffEmail: data[0].staff_email,
          salonId: data[0].salon_id,
          loginTime: new Date().toISOString()
        })
      );
      toast({ title: 'Success', description: `Welcome ${data[0].staff_name}!` });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: 'Staff Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/?welcome=true`,
          data: {
            full_name: signupForm.fullName,
            salon_name: signupForm.salonName
          }
        }
      });
      if (error) throw error;
      toast({
        title: 'Account Created!',
        description: 'Check your email for confirmation link.'
      });
      setSignupForm({ email: '', password: '', fullName: '', salonName: '' });
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Could not create account',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg rounded-2xl shadow-xl border border-gray-200">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Welcome to Aura</CardTitle>
          <CardDescription className="text-gray-500">
            Smart CRM platform for modern salons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="login">Owner Login</TabsTrigger>
              <TabsTrigger value="staff">Staff Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="staff">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <Input
                  id="staff-id"
                  placeholder="Staff ID"
                  value={staffLoginForm.staffId}
                  onChange={(e) => setStaffLoginForm({ ...staffLoginForm, staffId: e.target.value })}
                  required
                />
                <Input
                  id="staff-password"
                  type="password"
                  placeholder="Staff Password"
                  value={staffLoginForm.staffPassword}
                  onChange={(e) => setStaffLoginForm({ ...staffLoginForm, staffPassword: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Staff Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  id="full-name"
                  placeholder="Full Name"
                  value={signupForm.fullName}
                  onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                  required
                />
                <Input
                  id="salon-name"
                  placeholder="Salon Name"
                  value={signupForm.salonName}
                  onChange={(e) => setSignupForm({ ...signupForm, salonName: e.target.value })}
                  required
                />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                  minLength={6}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
