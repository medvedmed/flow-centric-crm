
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Phone, 
  Users, 
  Settings, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';
import { enhancedWhatsAppClient, WhatsAppSession, MessageQueueItem, WhatsAppContact } from '@/services/enhancedWhatsAppClient';
import { useToast } from '@/hooks/use-toast';

// FIXED: QR Code Component
const QRCodeDisplay: React.FC<{ qrData: string }> = ({ qrData }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (qrData) {
      // Generate QR code using a QR code API service
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [qrData]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
        {qrCodeUrl ? (
          <img 
            src={qrCodeUrl} 
            alt="WhatsApp QR Code" 
            className="w-64 h-64"
            onError={() => {
              console.error('Failed to load QR code image');
            }}
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 text-center max-w-sm">
        Open WhatsApp on your phone and scan this QR code to connect
      </p>
    </div>
  );
};

export const EnhancedWhatsAppSection: React.FC = () => {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [messageQueue, setMessageQueue] = useState<MessageQueueItem[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('connection');
  const { toast } = useToast();

  useEffect(() => {
    loadSessionStatus();
    loadMessageQueue();
    loadContacts();
  }, []);

  const loadSessionStatus = async () => {
    const sessionData = await enhancedWhatsAppClient.getSessionStatus();
    setSession(sessionData);
  };

  const loadMessageQueue = async () => {
    const queue = await enhancedWhatsAppClient.getMessageQueue();
    setMessageQueue(queue);
  };

  const loadContacts = async () => {
    const contactList = await enhancedWhatsAppClient.getContacts();
    setContacts(contactList);
  };

  const handleInitializeSession = async () => {
    setIsLoading(true);
    try {
      const result = await enhancedWhatsAppClient.initializeSession();
      if (result.success) {
        toast({
          title: "Session Initialized",
          description: "WhatsApp session has been initialized. Please scan the QR code.",
        });
        await loadSessionStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Failed to initialize session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticateSession = async () => {
    setIsLoading(true);
    try {
      const result = await enhancedWhatsAppClient.authenticateSession();
      if (result.success) {
        toast({
          title: "Authentication Successful",
          description: "WhatsApp session has been authenticated successfully!",
        });
        await loadSessionStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to authenticate session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectSession = async () => {
    setIsLoading(true);
    try {
      const result = await enhancedWhatsAppClient.disconnectSession();
      if (result.success) {
        toast({
          title: "Session Disconnected",
          description: "WhatsApp session has been disconnected.",
        });
        await loadSessionStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatusBadge = () => {
    if (!session) return <Badge variant="secondary">Unknown</Badge>;
    
    if (session.is_connected) {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    } else if (session.connection_state === 'qr_ready') {
      return <Badge variant="secondary" className="bg-yellow-500">QR Ready</Badge>;
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
            <h2 className="text-2xl font-bold text-gray-900">WhatsApp Web.js Connection</h2>
            <p className="text-gray-600">Manage your WhatsApp integration for appointment reminders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getConnectionStatusBadge()}
          {session?.phone_number && (
            <div className="text-sm text-gray-600">
              Phone: <span className="font-medium">{session.phone_number}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Connection Status</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {session?.connection_state || 'Disconnected'}
                  </p>
                </div>
                {getConnectionStatusBadge()}
              </div>

              {session?.connection_state === 'qr_ready' && session.qr_code && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Scan the QR code below with your WhatsApp mobile app to connect.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <QRCodeDisplay qrData={session.qr_code} />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={handleAuthenticateSession} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Complete Authentication
                    </Button>
                  </div>
                </div>
              )}

              {!session?.is_connected && session?.connection_state !== 'qr_ready' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Initialize a new WhatsApp session to start sending messages.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={handleInitializeSession} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Initialize Session
                  </Button>
                </div>
              )}

              {session?.is_connected && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp session is connected and ready to send messages.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={loadSessionStatus} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Status
                    </Button>
                    <Button onClick={handleDisconnectSession} variant="destructive" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}

              {/* Session Information */}
              {session && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Messages Sent Today</h4>
                    <p className="text-lg font-semibold">{session.messages_sent_today}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Last Activity</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(session.last_activity).toLocaleString()}
                    </p>
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
              {messageQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages in queue
                </div>
              ) : (
                <div className="space-y-2">
                  {messageQueue.slice(0, 10).map(message => (
                    <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.recipient_phone}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.status}
                          </Badge>
                          {message.reminder_type && (
                            <Badge variant="secondary" className="text-xs">
                              {message.reminder_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {message.message_content}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(message.scheduled_for).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                WhatsApp Contacts ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contacts found
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.slice(0, 10).map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {contact.contact_name || contact.phone_number}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.phone_number}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.is_business && (
                          <Badge variant="outline" className="text-xs">Business</Badge>
                        )}
                        {contact.is_blocked && (
                          <Badge variant="destructive" className="text-xs">Blocked</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  WhatsApp Web.js settings and configuration options will be available here.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-reconnection</h4>
                    <p className="text-sm text-gray-600">Automatic session recovery on disconnect</p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Message Queue Processing</h4>
                    <p className="text-sm text-gray-600">Automated reminder processing with retry logic</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Ban Protection</h4>
                    <p className="text-sm text-gray-600">Human-like delays and rate limiting</p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
