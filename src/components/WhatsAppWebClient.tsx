import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Smartphone, Wifi, WifiOff, Send, QrCode, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WhatsAppSession {
  id: string;
  is_connected: boolean;
  connection_state: 'disconnected' | 'connecting' | 'connected' | 'ready';
  phone_number?: string;
  qr_code?: string;
  last_connected_at?: string;
  client_info?: any;
}

interface WhatsAppMessage {
  id: string;
  recipient_phone: string;
  recipient_name?: string;
  message_content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  error_message?: string;
}

export const WhatsAppWebClient: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your salon.');

  useEffect(() => {
    if (user) {
      loadSession();
      loadMessages();
      subscribeToUpdates();
    }
  }, [user]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('salon_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading session:', error);
        return;
      }

      // Cast the database response to match our interface
      if (data) {
        const sessionData: WhatsAppSession = {
          id: data.id,
          is_connected: data.is_connected,
          connection_state: data.connection_state as WhatsAppSession['connection_state'],
          phone_number: data.phone_number || undefined,
          qr_code: data.qr_code || undefined,
          last_connected_at: data.last_connected_at || undefined,
          client_info: data.client_info || undefined
        };
        setSession(sessionData);
      }
    } catch (error) {
      console.error('Error in loadSession:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('salon_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      // Cast the database response to match our interface
      if (data) {
        const messagesData: WhatsAppMessage[] = data.map(msg => ({
          id: msg.id,
          recipient_phone: msg.recipient_phone,
          recipient_name: msg.recipient_name || undefined,
          message_content: msg.message_content,
          status: msg.status as WhatsAppMessage['status'],
          sent_at: msg.sent_at || undefined,
          error_message: msg.error_message || undefined
        }));
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  };

  const subscribeToUpdates = () => {
    const sessionChannel = supabase
      .channel('whatsapp-session')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `salon_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Session update:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            const sessionData: WhatsAppSession = {
              id: newData.id,
              is_connected: newData.is_connected,
              connection_state: newData.connection_state as WhatsAppSession['connection_state'],
              phone_number: newData.phone_number || undefined,
              qr_code: newData.qr_code || undefined,
              last_connected_at: newData.last_connected_at || undefined,
              client_info: newData.client_info || undefined
            };
            setSession(sessionData);
          }
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('whatsapp-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `salon_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Message update:', payload);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(messagesChannel);
    };
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-web-client', {
        body: { action: 'connect' }
      });

      if (error) throw error;

      toast({
        title: 'Connecting...',
        description: 'Initializing WhatsApp Web connection. Please wait for QR code.',
      });
    } catch (error) {
      console.error('Connect error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize WhatsApp connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-web-client', {
        body: { action: 'disconnect' }
      });

      if (error) throw error;

      toast({
        title: 'Disconnected',
        description: 'WhatsApp session has been disconnected.',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect WhatsApp session.',
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
      const { data, error } = await supabase.functions.invoke('whatsapp-web-client', {
        body: {
          action: 'send_message',
          phone: testPhone,
          message: testMessage
        }
      });

      if (error) throw error;

      toast({
        title: 'Message Sent',
        description: 'Test message has been sent successfully!',
      });

      setTestPhone('');
      setTestMessage('Hello! This is a test message from your salon.');
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: 'Send Error',
        description: 'Failed to send message. Please try again.',
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
        return 'Ready';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Web Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(session?.connection_state || 'disconnected')}`} />
              <span className="font-medium">
                Status: {getStatusText(session?.connection_state || 'disconnected')}
              </span>
              {session?.phone_number && (
                <Badge variant="outline">
                  <Smartphone className="w-3 h-3 mr-1" />
                  {session.phone_number}
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
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wifi className="w-4 h-4 mr-2" />}
                  Connect
                </Button>
              )}
            </div>
          </div>

          {session?.qr_code && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4" />
                <span className="font-medium">Scan QR Code with WhatsApp</span>
              </div>
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${session.qr_code}`}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                Open WhatsApp on your phone and scan this QR code to connect
              </p>
            </div>
          )}

          {session?.last_connected_at && (
            <p className="text-sm text-gray-600">
              Last connected: {new Date(session.last_connected_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test Message */}
      {session?.is_connected && (
        <Card>
          <CardHeader>
            <CardTitle>Send Test Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test_phone">Phone Number (with country code)</Label>
              <Input
                id="test_phone"
                placeholder="+1234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="test_message">Message</Label>
              <Textarea
                id="test_message"
                placeholder="Enter your test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={loading || !testPhone || !testMessage}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send Test Message
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{message.recipient_name || message.recipient_phone}</span>
                    <Badge
                      variant={message.status === 'sent' ? 'default' : 
                              message.status === 'failed' ? 'destructive' : 'secondary'}
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
                <p>No messages sent yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
