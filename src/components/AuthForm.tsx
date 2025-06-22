
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        password: loginForm.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. If you\'re a staff member, please use the "Staff Login" tab.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before logging in.');
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login",
        variant: "destructive",
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
        throw new Error('Invalid staff ID or password. Please check your credentials.');
      }

      const staffData = data[0];
      
      // Create a session for the staff member using their email
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: staffData.staff_email,
        password: 'staff-placeholder-password', // This will fail, but we'll handle it
      });

      // Since staff don't have regular auth accounts, we'll store their info differently
      // For now, we'll use localStorage to track staff sessions
      localStorage.setItem('staff_session', JSON.stringify({
        staffId: staffData.staff_id,
        staffName: staffData.staff_name,
        staffEmail: staffData.staff_email,
        salonId: staffData.salon_id,
        loginTime: new Date().toISOString()
      }));

      toast({
        title: "Success",
        description: `Welcome ${staffData.staff_name}!`,
      });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Staff Login Failed",
        description: error.message || "Invalid staff credentials",
        variant: "destructive",
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
            salon_name: signupForm.salonName || null,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email for a confirmation link. After confirming, you can log in.",
      });
      
      setSignupForm({ email: '', password: '', fullName: '', salonName: '' });
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Aura Platform
          </CardTitle>
          <CardDescription>
            Professional salon management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Owner Login</TabsTrigger>
              <TabsTrigger value="staff">Staff Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>For Salon Owners/Managers:</strong> Use your email and password to log in.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="staff">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>For Staff Members:</strong> Use your Staff ID and Password provided by your salon manager.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-id">Staff ID</Label>
                  <Input
                    id="staff-id"
                    placeholder="Enter your Staff ID"
                    value={staffLoginForm.staffId}
                    onChange={(e) => setStaffLoginForm({...staffLoginForm, staffId: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-password">Staff Password</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="Enter your Staff Password"
                    value={staffLoginForm.staffPassword}
                    onChange={(e) => setStaffLoginForm({...staffLoginForm, staffPassword: e.target.value})}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Staff Login
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Salon Owners:</strong> Create your salon account here.<br/>
                  <strong>Staff Members:</strong> Your salon owner will provide your login credentials.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Enter your full name"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-salon">Salon Name</Label>
                  <Input
                    id="signup-salon"
                    placeholder="Enter your salon name"
                    value={signupForm.salonName}
                    onChange={(e) => setSignupForm({...signupForm, salonName: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Account
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
