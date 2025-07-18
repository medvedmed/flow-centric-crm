
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, Smartphone, QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppSession {
  id: string;
  is_connected: boolean;
  connection_state: string;
  phone_number?: string;
  qr_code?: string;
  last_connected_at?: string;
}

export const WhatsAppQRIntegration: React.FC = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    checkWhatsAppStatus();
    
    // Set up real-time subscription for session updates
    const channel = supabase
      .channel('whatsapp-session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions'
        },
        (payload) => {
          console.log('WhatsApp session update:', payload);
          if (payload.new) {
            const newSession = payload.new as WhatsAppSession;
            setSession(newSession);
            if (newSession.qr_code) {
              setQrCode(newSession.qr_code);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await supabase.functions.invoke('whatsapp-web-enhanced', {
        body: { action: 'get_status' }
      });

      if (response.data?.session) {
        setSession(response.data.session);
        if (response.data.session.qr_code) {
          setQrCode(response.data.session.qr_code);
        }
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setQrCode(null);
      
      const response = await supabase.functions.invoke('whatsapp-web-enhanced', {
        body: { action: 'connect' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Connecting to WhatsApp",
        description: "Please scan the QR code with your phone to connect WhatsApp Web",
      });

      // The QR code will be updated via real-time subscription
    } catch (error: any) {
      console.error('Error connecting WhatsApp:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to WhatsApp",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await supabase.functions.invoke('whatsapp-web-enhanced', {
        body: { action: 'disconnect' }
      });

      setSession(null);
      setQrCode(null);
      
      toast({
        title: "Disconnected",
        description: "WhatsApp has been disconnected successfully",
      });
    } catch (error: any) {
      console.error('Error disconnecting WhatsApp:', error);
      toast({
        title: "Disconnection Error",
        description: error.message || "Failed to disconnect WhatsApp",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatusBadge = () => {
    if (!session) return <Badge variant="outline">Not Connected</Badge>;
    
    switch (session.connection_state) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Connecting</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>;
      default:
        return <Badge variant="outline">{session.connection_state}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading WhatsApp status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            WhatsApp Web Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getConnectionStatusBadge()}
              </div>
              {session?.phone_number && (
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">{session.phone_number}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={checkWhatsAppStatus}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              {session?.is_connected ? (
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  size="sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {connecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Connect
                </Button>
              )}
            </div>
          </div>

          {session?.last_connected_at && (
            <div className="text-sm text-gray-500">
              Last connected: {new Date(session.last_connected_at).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Open WhatsApp on your phone, go to Settings → Linked Devices → Link a Device, and scan this QR code.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <div 
                className="p-4 bg-white rounded-lg border-2 border-gray-200 inline-block"
                dangerouslySetInnerHTML={{ 
                  __html: atob(qrCode) 
                }} 
              />
            </div>
            
            <p className="text-sm text-gray-600">
              The QR code will refresh automatically. Keep this page open while scanning.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Connection Success */}
      {session?.is_connected && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">WhatsApp Connected Successfully!</div>
                <div className="text-sm text-gray-600 mt-1">
                  Your salon can now send automated appointment reminders via WhatsApp.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
