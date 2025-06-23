
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, QrCode, CheckCircle, AlertCircle, Smartphone, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { whatsappClient, WhatsAppSessionData } from '@/services/whatsappClient';

export const RealWhatsAppClient: React.FC = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<WhatsAppSessionData | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionCheckInterval, setConnectionCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSession();
    
    // Subscribe to real-time session updates
    const channel = whatsappClient.subscribeToSessionUpdates((updatedSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
      
      if (updatedSession.is_connected) {
        setConnecting(false);
        setQrCode(null);
        toast({
          title: "WhatsApp Connected!",
          description: `Connected to ${updatedSession.phone_number}`,
        });
      }
    });

    return () => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
      channel.unsubscribe();
    };
  }, []);

  const loadSession = async () => {
    try {
      const sessionData = await whatsappClient.getSession();
      console.log('Loaded session:', sessionData);
      setSession(sessionData);
      
      if (sessionData?.qr_code && !sessionData.is_connected) {
        setQrCode(sessionData.qr_code);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const initiateConnection = async () => {
    setLoading(true);
    setConnecting(true);
    
    try {
      console.log('Initiating WhatsApp connection...');
      const result = await whatsappClient.initializeSession();
      console.log('Session initialized:', result);
      
      setQrCode(result.qr_code);
      
      // Start checking for connection
      const interval = setInterval(async () => {
        try {
          const connectionStatus = await whatsappClient.checkConnection();
          console.log('Connection status:', connectionStatus);
          
          if (connectionStatus.is_connected) {
            setSession(prev => prev ? {
              ...prev,
              is_connected: true,
              connection_state: 'connected',
              phone_number: connectionStatus.phone_number
            } : null);
            setConnecting(false);
            setQrCode(null);
            clearInterval(interval);
            
            toast({
              title: "WhatsApp Connected!",
              description: `Successfully connected to ${connectionStatus.phone_number}`,
            });
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }, 3000);
      
      setConnectionCheckInterval(interval);
      
      toast({
        title: "QR Code Generated",
        description: "Scan the QR code with your WhatsApp to connect",
      });
      
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initialize WhatsApp connection",
        variant: "destructive",
      });
      setConnecting(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await whatsappClient.disconnect();
      setSession(prev => prev ? {
        ...prev,
        is_connected: false,
        connection_state: 'disconnected',
        phone_number: undefined
      } : null);
      setQrCode(null);
      
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        setConnectionCheckInterval(null);
      }
      
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

  const getConnectionStatusIcon = () => {
    if (session?.is_connected) return <Wifi className="w-4 h-4 text-green-600" />;
    if (connecting) return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    return <WifiOff className="w-4 h-4 text-gray-500" />;
  };

  const getConnectionStatusText = () => {
    if (session?.is_connected) return `Connected to ${session.phone_number}`;
    if (connecting) return 'Waiting for QR scan...';
    return 'Not connected';
  };

  const getConnectionStatusColor = () => {
    if (session?.is_connected) return 'bg-green-100 text-green-800';
    if (connecting) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Web Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getConnectionStatusIcon()}
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
            {session?.is_connected ? 'Connected' : connecting ? 'Connecting' : 'Disconnected'}
          </Badge>
        </div>

        {/* QR Code Section */}
        {qrCode && !session?.is_connected && (
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-48 h-48 mx-auto bg-white border rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <div className="text-xs text-gray-500 font-mono break-all px-2">
                    {qrCode}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Scan this QR code with WhatsApp
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <Smartphone className="w-3 h-3" />
                  <span>Open WhatsApp → Settings → Linked Devices → Link a Device</span>
                </div>
              </div>
              {connecting && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Waiting for scan...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!session?.is_connected ? (
            <Button 
              onClick={initiateConnection} 
              disabled={loading || connecting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              {connecting ? "Connecting..." : "Connect WhatsApp"}
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-600 flex-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp Connected</span>
              </div>
              <Button variant="outline" onClick={disconnect} disabled={loading}>
                Disconnect
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to connect:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Click "Connect WhatsApp" to generate a QR code</li>
            <li>2. Open WhatsApp on your phone</li>
            <li>3. Go to Settings → Linked Devices → Link a Device</li>
            <li>4. Scan the QR code displayed above</li>
            <li>5. Your CRM will automatically connect to your WhatsApp</li>
          </ol>
        </div>

        {/* Connection Info */}
        {session?.is_connected && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Connection Active</span>
            </div>
            <p className="text-sm text-green-700">
              Your CRM can now send WhatsApp messages automatically using your connected account.
              All messages will appear to come from your personal WhatsApp number.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
