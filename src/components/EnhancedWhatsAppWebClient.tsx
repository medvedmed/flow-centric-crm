import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Smartphone, Wifi, WifiOff, Send, QrCode, Loader2, Zap, CheckCircle } from 'lucide-react';
import { whatsappServerClient, WhatsAppServerSession, WhatsAppServerMessage } from '@/services/whatsappServerClient';

export const EnhancedWhatsAppWebClient: React.FC = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<WhatsAppServerSession | null>(null);
  const [messages, setMessages] = useState<WhatsAppServerMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your enhanced salon system.');
  const subscriptionRef = useRef<any>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSession();
    loadMessages();
    setupSubscriptions();
    startStatusPolling();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
    };
  }, []);

  const loadSession = async () => {
    try {
      const { session: sessionData } = await whatsappServerClient.getStatus();
      setSession(sessionData);
    } catch (error) {
      console.error('Error loading session:', error);
      // Set default disconnected state
      setSession({
        id: 'whatsapp-session',
        is_connected: false,
        connection_state: 'disconnected'
      });
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await whatsappServerClient.getMessageHistory();
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupSubscriptions = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = whatsappServerClient.subscribeToMessageUpdates((message) => {
      console.log('Enhanced message update:', message);
      loadMessages(); // Refresh messages when new ones arrive
    });
  };

  const startStatusPolling = () => {
    // Poll status every 5 seconds to keep UI updated
    statusPollingRef.current = setInterval(async () => {
      try {
        const { session: sessionData } = await whatsappServerClient.getStatus();
        setSession(sessionData);
      } catch (error) {
        // Silently handle polling errors
        console.error('Status polling error:', error);
      }
    }, 5000);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const result = await whatsappServerClient.connect();
      
      toast({
        title: 'Enhanced Connection Starting',
        description: 'Initializing WhatsApp Web with enhanced features. Please scan the QR code when it appears.',
      });

      // Start polling for QR code and status updates
      setTimeout(loadSession, 2000);
    } catch (error) {
      console.error('Enhanced connect error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize enhanced WhatsApp connection: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await whatsappServerClient.disconnect();

      toast({
        title: 'Disconnected',
        description: 'Enhanced WhatsApp session has been disconnected.',
      });

      // Update local state
      setSession(prev => prev ? { ...prev, is_connected: false, connection_state: 'disconnected' } : null);
    } catch (error) {
      console.error('Enhanced disconnect error:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect enhanced WhatsApp session: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both phone number and message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await whatsappServerClient.sendMessage(testPhone, testMessage);

      toast({
        title: 'Enhanced Message Sent',
        description: 'Test message has been sent with enhanced delivery tracking!',
      });

      setTestPhone('');
      setTestMessage('Hello! This is a test message from your enhanced salon system.');
      
      // Refresh messages
      setTimeout(loadMessages, 1000);
    } catch (error) {
      console.error('Enhanced send message error:', error);
      toast({
        title: 'Send Error',
        description: 'Failed to send enhanced message: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'ready':
        return 'Ready & Enhanced';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Connection Status */}
      <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-600" />
            Enhanced WhatsApp Web Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(session?.connection_state || 'disconnected')}`} />
              <span className="font-medium text-gray-900">
                Status: {getStatusText(session?.connection_state || 'disconnected')}
              </span>
              {session?.phone_number && (
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                  <Smartphone className="w-3 h-3 mr-1" />
                  {session.phone_number}
                </Badge>
              )}
              {session?.is_connected && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enhanced Features Active
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {session?.is_connected ? (
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wifi className="w-4 h-4 mr-2" />}
                  Connect Enhanced
                </Button>
              )}
            </div>
          </div>

          {session?.qr_code && (
            <div className="p-4 border rounded-lg bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-violet-600" />
                <span className="font-medium text-gray-900">Scan Enhanced QR Code with WhatsApp</span>
                <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200">Enhanced</Badge>
              </div>
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${session.qr_code}`}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48 border-2 border-violet-200 rounded-lg bg-white shadow-sm"
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                Scan with WhatsApp to enable enhanced features including automation and advanced messaging
              </p>
            </div>
          )}

          {session?.last_connected_at && (
            <p className="text-sm text-gray-600">
              Last connected: {new Date(session.last_connected_at).toLocaleString()}
            </p>
          )}

          {session?.webjs_session_data?.features && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Enhanced Features Available:</h4>
              <div className="flex flex-wrap gap-2">
                {session.webjs_session_data.features.map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Test Message */}
      {session?.is_connected && (
        <Card className="bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Send className="h-5 w-5 text-blue-600" />
              Send Enhanced Test Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test_phone" className="text-gray-900">Phone Number (with country code)</Label>
              <Input
                id="test_phone"
                placeholder="+1234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="test_message" className="text-gray-900">Message</Label>
              <Textarea
                id="test_message"
                placeholder="Enter your test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="bg-white border-gray-300"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={loading || !testPhone || !testMessage}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send Enhanced Message
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Messages with Enhanced Status */}
      <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Enhanced Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="p-3 border rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{message.recipient_name || message.recipient_phone}</span>
                    <Badge
                      variant={message.status === 'sent' ? 'default' : 
                              message.status === 'delivered' ? 'secondary' :
                              message.status === 'failed' ? 'destructive' : 'outline'}
                      className="ml-2"
                    >
                      {message.status}
                    </Badge>
                  </div>
                  {message.sent_at && (
                    <span className="text-xs text-gray-500">
                      {new Date(message.sent_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{message.message_content}</p>
                {message.error_message && (
                  <p className="text-xs text-red-600 mt-1">{message.error_message}</p>
                )}
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No enhanced messages sent yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
