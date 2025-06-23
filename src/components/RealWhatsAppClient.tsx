
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, QrCode, CheckCircle, AlertCircle, Smartphone, RefreshCw, Wifi, WifiOff, RotateCcw, Download, ZoomIn } from 'lucide-react';
import { whatsappClient, WhatsAppSessionData } from '@/services/whatsappClient';

export const RealWhatsAppClient: React.FC = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<WhatsAppSessionData | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrImageData, setQrImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionCheckInterval, setConnectionCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showZoomedQR, setShowZoomedQR] = useState(false);

  useEffect(() => {
    loadSession();
    
    // Subscribe to real-time session updates
    const channel = whatsappClient.subscribeToSessionUpdates((updatedSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
      
      if (updatedSession.is_connected) {
        setConnecting(false);
        setQrCode(null);
        setQrImageData(null);
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
        if (sessionData.qr_image_data) {
          setQrImageData(sessionData.qr_image_data);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const resetAndConnect = async () => {
    setLoading(true);
    try {
      console.log('Resetting session...');
      await whatsappClient.resetSession();
      
      // Clear local state
      setSession(null);
      setQrCode(null);
      setQrImageData(null);
      setConnecting(false);
      
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        setConnectionCheckInterval(null);
      }
      
      toast({
        title: "Session Reset",
        description: "WhatsApp session has been reset. Click 'Connect WhatsApp' to start fresh.",
      });
    } catch (error) {
      console.error('Error resetting session:', error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset WhatsApp session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshQRCode = async () => {
    setQrLoading(true);
    try {
      const result = await whatsappClient.getQRCode();
      setQrCode(result.qr_code || null);
      setQrImageData(result.qr_image_data || null);
      
      toast({
        title: "QR Code Refreshed",
        description: "A new QR code has been generated",
      });
    } catch (error) {
      console.error('Error refreshing QR code:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh QR code",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrImageData) return;
    
    const link = document.createElement('a');
    link.href = qrImageData;
    link.download = 'whatsapp-qr-code.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR code saved to your downloads folder",
    });
  };

  const initiateConnection = async () => {
    setLoading(true);
    setConnecting(true);
    
    try {
      console.log('Initiating WhatsApp connection...');
      const result = await whatsappClient.initializeSession();
      console.log('Session initialized:', result);
      
      setQrCode(result.qr_code);
      setQrImageData(result.qr_image_data);
      
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
            setQrImageData(null);
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
      setQrImageData(null);
      
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
        {qrImageData && !session?.is_connected && (
          <div className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={qrImageData} 
                    alt="WhatsApp QR Code" 
                    className="w-72 h-72 border-2 border-gray-200 rounded-lg shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowZoomedQR(true)}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {qrLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">
                  Scan this QR code with WhatsApp
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <Smartphone className="w-3 h-3" />
                  <span>Open WhatsApp → Settings → Linked Devices → Link a Device</span>
                </div>
                
                {/* QR Code Actions */}
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshQRCode}
                    disabled={qrLoading}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${qrLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowZoomedQR(true)}
                    className="flex items-center gap-1"
                  >
                    <ZoomIn className="w-3 h-3" />
                    Zoom
                  </Button>
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

        {/* Zoomed QR Code Modal */}
        {showZoomedQR && qrImageData && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowZoomedQR(false)}>
            <div className="relative bg-white p-8 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
              <button
                onClick={() => setShowZoomedQR(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">WhatsApp QR Code</h3>
                <img 
                  src={qrImageData} 
                  alt="WhatsApp QR Code - Zoomed" 
                  className="w-96 h-96 border border-gray-200 rounded-lg shadow-lg bg-white mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
                <p className="text-sm text-gray-600 mt-4">
                  Click outside this modal to close
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!session?.is_connected ? (
            <>
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
              {(session || qrCode) && (
                <Button 
                  variant="outline" 
                  onClick={resetAndConnect} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </>
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
          <p className="text-xs text-blue-600 mt-2">
            💡 If the QR code appears broken, try clicking "Refresh" or "Reset".
          </p>
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
