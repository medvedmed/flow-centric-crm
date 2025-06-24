
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Phone, 
  Users, 
  Settings, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Send,
  QrCode,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppSession {
  id: string;
  salon_id: string;
  is_connected: boolean;
  connection_state: string;
  qr_code?: string;
  phone_number?: string;
  client_info?: any;
  messages_sent_today: number;
  last_activity: string;
}

interface MessageQueueItem {
  id: string;
  recipient_phone: string;
  message_content: string;
  status: string;
  scheduled_for: string;
  appointment_id?: string;
  reminder_type?: string;
  attempts: number;
  error_message?: string;
}

// Real QR Code Display Component
const RealQRCodeDisplay: React.FC<{ qrData: string; onScan: () => void }> = ({ qrData, onScan }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [scanInProgress, setScanInProgress] = useState(false);

  useEffect(() => {
    if (qrData) {
      // Generate QR code using QR Server API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [qrData]);

  const handleScanComplete = () => {
    setScanInProgress(true);
    onScan();
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="relative">
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-lg">
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="WhatsApp QR Code" 
              className="w-64 h-64 rounded-lg"
              onError={() => {
                console.error('Failed to load QR code image');
              }}
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Scanning overlay */}
        {scanInProgress && (
          <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Connecting...</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <QrCode className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Scan with WhatsApp</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Open WhatsApp on your phone</p>
          <p>2. Tap Menu (⋮) &gt; Linked Devices</p>
          <p>3. Tap "Link a Device"</p>
          <p>4. Point your phone camera at this QR code</p>
        </div>
      </div>

      <Button 
        onClick={handleScanComplete}
        disabled={scanInProgress}
        className="bg-green-600 hover:bg-green-700"
      >
        {scanInProgress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        I've Scanned the QR Code
      </Button>
    </div>
  );
};

// Message Queue Display Component
const MessageQueueDisplay: React.FC<{ messages: MessageQueueItem[] }> = ({ messages }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No messages in queue</p>
        </div>
      ) : (
        messages.map(message => (
          <div key={message.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{message.recipient_phone}</span>
                <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                  {message.status}
                </Badge>
                {message.reminder_type && (
                  <Badge variant="outline" className="text-xs">
                    {message.reminder_type}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(message.scheduled_for).toLocaleString()}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {message.message_content}
            </p>
            
            {message.error_message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {message.error_message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Attempts: {message.attempts}/3</span>
              {message.appointment_id && (
                <Badge variant="outline" className="text-xs">
                  Appointment Reminder
                </Badge>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export const RealWhatsAppIntegration: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [messageQueue, setMessageQueue] = useState<MessageQueueItem[]>([]);
  const [activeTab, setActiveTab] = useState('connection');

  useEffect(() => {
    loadSessionStatus();
    loadMessageQueue();
    
    // Set up real-time subscriptions
    const sessionChannel = supabase
      .channel('whatsapp-session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions'
        },
        (payload) => {
          console.log('Session update:', payload);
          loadSessionStatus();
        }
      )
      .subscribe();

    const queueChannel = supabase
      .channel('whatsapp-queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_message_queue'
        },
        (payload) => {
          console.log('Queue update:', payload);
          loadMessageQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(queueChannel);
    };
  }, []);

  const loadSessionStatus = async () => {
    try {
      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: { action: 'get_status' }
      });

      if (response.data?.session) {
        setSession(response.data.session);
      }
    } catch (error) {
      console.error('Error loading session status:', error);
    }
  };

  const loadMessageQueue = async () => {
    try {
      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: { action: 'get_queue' }
      });

      if (response.data?.queue) {
        setMessageQueue(response.data.queue);
      }
    } catch (error) {
      console.error('Error loading message queue:', error);
    }
  };

  const handleInitializeSession = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: { action: 'initialize' }
      });

      if (response.data?.success) {
        toast({
          title: "Session Initialized",
          description: "WhatsApp session initialized. Please scan the QR code with your phone.",
        });
        await loadSessionStatus();
      } else {
        throw new Error(response.data?.error || 'Failed to initialize session');
      }
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Failed to initialize session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanned = async () => {
    setLoading(true);
    try {
      // Poll for authentication status
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds
      
      const checkAuth = async (): Promise<boolean> => {
        const response = await supabase.functions.invoke('whatsapp-webjs', {
          body: { action: 'authenticate' }
        });
        
        return response.data?.success === true;
      };
      
      while (attempts < maxAttempts) {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          toast({
            title: "Connected Successfully!",
            description: "Your WhatsApp is now connected and ready to send messages.",
          });
          await loadSessionStatus();
          setLoading(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      throw new Error('Authentication timeout. Please try scanning the QR code again.');
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('whatsapp-webjs', {
        body: { action: 'disconnect' }
      });

      if (response.data?.success) {
        toast({
          title: "Disconnected",
          description: "WhatsApp session has been disconnected.",
        });
        await loadSessionStatus();
      } else {
        throw new Error(response.data?.error || 'Failed to disconnect');
      }
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusBadge = () => {
    if (!session) return <Badge variant="secondary">Unknown</Badge>;
    
    if (session.is_connected) {
      return <Badge className="bg-green-500 hover:bg-green-600">Connected</Badge>;
    } else if (session.connection_state === 'qr_ready') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">QR Ready</Badge>;
    } else if (session.connection_state === 'initializing') {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Initializing</Badge>;
    } else {
      return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h2>
            <p className="text-gray-600">Real WhatsApp Web.js connection for appointment reminders</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {getConnectionStatusBadge()}
          {session?.phone_number && (
            <div className="text-sm text-gray-600">
              <Phone className="w-4 h-4 inline mr-1" />
              {session.phone_number}
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">WhatsApp Status</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {session?.connection_state || 'Disconnected'}
                  </p>
                </div>
                {getConnectionStatusBadge()}
              </div>

              {/* QR Code Display */}
              {session?.connection_state === 'qr_ready' && session.qr_code && (
                <div className="space-y-4">
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      Scan the QR code below with your WhatsApp mobile app to connect.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <RealQRCodeDisplay 
                      qrData={session.qr_code} 
                      onScan={handleQRScanned}
                    />
                  </div>
                </div>
              )}

              {/* Initialize Button */}
              {(!session || session.connection_state === 'disconnected') && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Initialize a new WhatsApp session to start sending appointment reminders.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleInitializeSession} 
                    disabled={loading} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
                    Initialize WhatsApp Session
                  </Button>
                </div>
              )}

              {/* Connected State */}
              {session?.is_connected && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp is connected and ready to send appointment reminders!
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{session.messages_sent_today}</div>
                      <div className="text-sm text-gray-600">Messages Today</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Connected</div>
                      <div className="text-xs text-gray-600">Status</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600">Last Activity</div>
                      <div className="text-sm font-medium">{new Date(session.last_activity).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={loadSessionStatus} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Status
                    </Button>
                    <Button onClick={handleDisconnect} variant="destructive" disabled={loading} className="flex-1">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Message Queue ({messageQueue.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MessageQueueDisplay messages={messageQueue} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                WhatsApp Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Advanced WhatsApp settings and automation preferences.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-reconnection</h4>
                    <p className="text-sm text-gray-600">Automatic session recovery on disconnect</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Message Queue Processing</h4>
                    <p className="text-sm text-gray-600">Automated reminder processing with retry logic</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Ban Protection</h4>
                    <p className="text-sm text-gray-600">Human-like delays and rate limiting (10 msg/min)</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Protected</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Real-time Updates</h4>
                    <p className="text-sm text-gray-600">Live session and message status updates</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
