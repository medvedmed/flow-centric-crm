
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Scissors, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', staffCode: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    salonName: '',
    staffCode: ''
  });
  const [loginMode, setLoginMode] = useState<'email' | 'staff'>('email');
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let email = loginForm.email;
      
      // If using staff code login, we need to find the email first
      if (loginMode === 'staff' && loginForm.staffCode) {
        const { data: staffData, error: staffError } = await supabase
          .rpc('get_user_by_staff_code', { code: loginForm.staffCode.toUpperCase() });
        
        if (staffError || !staffData || staffData.length === 0) {
          throw new Error('Invalid staff code. Please check your code and try again.');
        }
        
        email = staffData[0].email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: loginForm.password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      onAuthSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
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
      // If signing up with staff code, validate it first
      if (signupForm.staffCode) {
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('email, salon_id')
          .eq('staff_code', signupForm.staffCode.toUpperCase())
          .single();
        
        if (staffError || !staffData) {
          throw new Error('Invalid staff code. Please check your code and try again.');
        }
        
        // Use the email from the staff record
        signupForm.email = staffData.email;
      }

      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/?welcome=true`,
          data: {
            full_name: signupForm.fullName,
            salon_name: signupForm.salonName || null,
            role: signupForm.staffCode ? 'staff' : 'salon_owner'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: signupForm.staffCode 
          ? "Staff account created successfully! Please check your email for verification."
          : "Account created successfully! Please check your email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={loginMode === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLoginMode('email')}
                    className="flex-1"
                  >
                    <Scissors className="w-4 h-4 mr-2" />
                    Owner/Manager
                  </Button>
                  <Button
                    type="button"
                    variant={loginMode === 'staff' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLoginMode('staff')}
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Staff
                  </Button>
                </div>

                {loginMode === 'email' ? (
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="staff-code">Staff Code</Label>
                    <Input
                      id="staff-code"
                      placeholder="Enter your 6-character staff code"
                      value={loginForm.staffCode}
                      onChange={(e) => setLoginForm({...loginForm, staffCode: e.target.value})}
                      maxLength={6}
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask your salon owner/manager for your staff code
                    </p>
                  </div>
                )}

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
            
            <TabsContent value="signup">
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
                  <Label htmlFor="staff-code-signup">Staff Code (Optional)</Label>
                  <Input
                    id="staff-code-signup"
                    placeholder="Enter staff code if joining a salon"
                    value={signupForm.staffCode}
                    onChange={(e) => setSignupForm({...signupForm, staffCode: e.target.value})}
                    maxLength={6}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty if you're creating a new salon account
                  </p>
                </div>

                {!signupForm.staffCode && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-salon">Salon Name</Label>
                    <Input
                      id="signup-salon"
                      placeholder="Enter your salon name"
                      value={signupForm.salonName}
                      onChange={(e) => setSignupForm({...signupForm, salonName: e.target.value})}
                      required={!signupForm.staffCode}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    required={!signupForm.staffCode}
                    disabled={!!signupForm.staffCode}
                  />
                  {signupForm.staffCode && (
                    <p className="text-xs text-muted-foreground">
                      Email will be auto-filled from staff code
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {signupForm.staffCode ? 'Join as Staff' : 'Create Salon Account'}
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
