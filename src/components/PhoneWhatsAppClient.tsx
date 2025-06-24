
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Phone, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { whatsappClient, WhatsAppSessionData } from '@/services/whatsappClient';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PhoneWhatsAppClient: React.FC = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<WhatsAppSessionData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<'phone' | 'verification' | 'connected'>('phone');

  useEffect(() => {
    loadSession();
    
    // Subscribe to real-time session updates
    const channel = whatsappClient.subscribeToSessionUpdates((updatedSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
      
      if (updatedSession.is_connected && updatedSession.phone_verified) {
        setStep('connected');
        toast({
          title: "WhatsApp Connected!",
          description: `Connected to ${updatedSession.phone_number}`,
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadSession = async () => {
    try {
      const sessionData = await whatsappClient.getSession();
      console.log('Loaded session:', sessionData);
      setSession(sessionData);
      
      if (sessionData?.is_connected && sessionData.phone_verified) {
        setStep('connected');
        setPhoneNumber(sessionData.phone_number || '');
      } else if (sessionData?.phone_number && !sessionData.phone_verified) {
        setStep('verification');
        setPhoneNumber(sessionData.phone_number);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const requestVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Basic phone number validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Requesting verification code for:', phoneNumber);
      const result = await whatsappClient.requestVerificationCode(phoneNumber);
      
      if (result.success) {
        setStep('verification');
        toast({
          title: "Verification Code Sent",
          description: "Please check your WhatsApp for the verification code",
        });
      } else {
        throw new Error(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error requesting verification code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Verification code must be 6 digits",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      console.log('Verifying code:', verificationCode);
      const result = await whatsappClient.verifyCode(phoneNumber, verificationCode);
      
      if (result.success) {
        setStep('connected');
        setSession(prev => prev ? {
          ...prev,
          is_connected: true,
          phone_verified: true,
          phone_number: phoneNumber
        } : null);
        
        toast({
          title: "WhatsApp Connected!",
          description: "Your phone number has been verified successfully",
        });
      } else {
        throw new Error(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await whatsappClient.disconnect();
      setSession(prev => prev ? {
        ...prev,
        is_connected: false,
        phone_verified: false,
        phone_number: undefined
      } : null);
      setStep('phone');
      setPhoneNumber('');
      setVerificationCode('');
      
      toast({
        title: "WhatsApp Disconnected",
        description: "Your WhatsApp account has been disconnected",
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToPhoneStep = () => {
    setStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
  };

  const getConnectionStatusColor = () => {
    if (session?.is_connected && session?.phone_verified) return 'bg-green-100 text-green-800';
    if (step === 'verification') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getConnectionStatusText = () => {
    if (session?.is_connected && session?.phone_verified) return `Connected to ${session.phone_number}`;
    if (step === 'verification') return 'Awaiting verification';
    return 'Not connected';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Business Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4" />
            <div>
              <p className="font-medium">{getConnectionStatusText()}</p>
              {session?.last_connected_at && (
                <p className="text-sm text-gray-600">
                  Last connected: {new Date(session.last_connected_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Badge className={getConnectionStatusColor()}>
            {session?.is_connected && session?.phone_verified ? 'Connected' : 
             step === 'verification' ? 'Verifying' : 'Disconnected'}
          </Badge>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">WhatsApp Phone Number</Label>
              <div className="mt-2">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Enter your WhatsApp Business phone number with country code
                </p>
              </div>
            </div>
            <Button 
              onClick={requestVerificationCode} 
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
          </div>
        )}

        {/* Verification Code Step */}
        {step === 'verification' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <div className="mt-2">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-lg text-center tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={verifyCode} 
                disabled={verifying || verificationCode.length !== 6}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {verifying ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {verifying ? 'Verifying...' : 'Verify Code'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetToPhoneStep}
                disabled={verifying}
              >
                Change Number
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={requestVerificationCode}
              disabled={loading}
              className="w-full text-sm"
            >
              Resend Code
            </Button>
          </div>
        )}

        {/* Connected Step */}
        {step === 'connected' && session?.is_connected && session?.phone_verified && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 justify-center">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">WhatsApp Connected Successfully</span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 text-center">
                Your CRM can now send WhatsApp messages automatically using your business account.
                All messages will appear to come from {session.phone_number}.
              </p>
            </div>
            <Button variant="outline" onClick={disconnect} disabled={loading} className="w-full">
              Disconnect WhatsApp
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Enter your WhatsApp Business phone number</li>
            <li>2. Receive a verification code via WhatsApp</li>
            <li>3. Enter the code to verify your number</li>
            <li>4. Start sending automated messages through your CRM</li>
          </ol>
          <p className="text-xs text-blue-600 mt-3">
            💡 You need a WhatsApp Business account for this feature to work properly.
          </p>
        </div>

        {/* Error Display */}
        {session && session.verification_attempts >= (session.max_verification_attempts || 3) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Too many verification attempts. Please wait before trying again or contact support.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
