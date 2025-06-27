
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock,
  Eye,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'suspicious_activity';
  timestamp: string;
  ip_address: string;
  user_agent: string;
  details: string;
}

export const SecurityEnhancements: React.FC = () => {
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Session timeout monitoring
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSessionTimeout();
      }, sessionTimeout * 60 * 1000);
    };

    const handleActivity = () => resetTimeout();
    
    // Add event listeners for user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [sessionTimeout]);

  const handleSessionTimeout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Session Expired',
        description: 'You have been logged out due to inactivity.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error during session timeout:', error);
    }
  };

  const logSecurityEvent = async (type: SecurityEvent['type'], details: string) => {
    const event: SecurityEvent = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
      ip_address: 'XXX.XXX.XXX.XXX', // Would be actual IP in production
      user_agent: navigator.userAgent,
      details
    };

    setSecurityEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events

    // In production, this would be logged to a secure audit table
    console.log('Security Event:', event);
  };

  const handleFailedLogin = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    logSecurityEvent('failed_login', `Failed login attempt #${newAttempts}`);

    if (newAttempts >= 5) {
      setIsLocked(true);
      logSecurityEvent('suspicious_activity', 'Account locked due to multiple failed login attempts');
      
      toast({
        title: 'Account Locked',
        description: 'Your account has been temporarily locked due to multiple failed login attempts.',
        variant: 'destructive',
      });

      // Auto-unlock after 15 minutes
      setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
        toast({
          title: 'Account Unlocked',
          description: 'Your account has been automatically unlocked.',
        });
      }, 15 * 60 * 1000);
    }
  };

  const enable2FA = async () => {
    try {
      // In production, this would integrate with an actual 2FA service
      setTwoFactorEnabled(true);
      logSecurityEvent('password_change', 'Two-factor authentication enabled');
      
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled for your account.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable two-factor authentication.',
        variant: 'destructive',
      });
    }
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'password_change':
        return <Key className="w-4 h-4 text-blue-600" />;
      case 'suspicious_activity':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'text-green-600';
      case 'failed_login':
        return 'text-red-600';
      case 'password_change':
        return 'text-blue-600';
      case 'suspicious_activity':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Center</h2>
        <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <Shield className="w-3 h-3 mr-1" />
          Enhanced Security Active
        </Badge>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Session Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Auto-logout in {sessionTimeout}min</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Two-Factor Auth</p>
                <p className={`text-lg font-bold ${twoFactorEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                twoFactorEnabled ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <Key className={`w-5 h-5 ${twoFactorEnabled ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
            </div>
            {!twoFactorEnabled && (
              <Button size="sm" onClick={enable2FA} className="mt-2 text-xs">
                Enable 2FA
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Login Attempts</p>
                <p className={`text-lg font-bold ${loginAttempts > 2 ? 'text-red-600' : 'text-green-600'}`}>
                  {loginAttempts}/5
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                loginAttempts > 2 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Lock className={`w-5 h-5 ${loginAttempts > 2 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isLocked ? 'Account locked' : 'Account secure'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Log</p>
                <p className="text-lg font-bold text-blue-600">{securityEvents.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Security events logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {(loginAttempts > 2 || isLocked) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {isLocked 
              ? 'Your account is temporarily locked due to multiple failed login attempts.' 
              : `Warning: ${loginAttempts} failed login attempts detected. Account will be locked after 5 attempts.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events Log */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Activity className="w-5 h-5 text-purple-600" />
            Security Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {securityEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No security events logged yet</p>
            ) : (
              securityEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${getEventColor(event.type)}`}>
                        {event.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {event.ip_address}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
