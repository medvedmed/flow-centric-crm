
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle, ExternalLink, Play, AlertCircle, QrCode, Smartphone, Users, Shield, Activity } from 'lucide-react';
import { enhancedWhatsAppClient, WhatsAppSession, MessageQueueItem, WhatsAppContact } from '@/services/enhancedWhatsAppClient';
import { reminderApi } from '@/services/api/reminderApi';
import { ReminderSettings, AppointmentReminder } from '@/services/types';

export const EnhancedWhatsAppSection: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [messageQueue, setMessageQueue] = useState<MessageQueueItem[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'connection' | 'messages' | 'contacts' | 'settings'>('connection');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWhatsAppData();
      setupRealtimeSubscriptions();
    }
  }, [isAuthenticated, user]);

  const loadWhatsAppData = async () => {
    try {
      const [sessionStatus, queue, contactList, reminderSettings, pendingReminders] = await Promise.all([
        enhancedWhatsAppClient.getSessionStatus(),
        enhancedWhatsAppClient.getMessageQueue(),
        enhancedWhatsAppClient.getContacts(),
        reminderApi.getReminderSettings(),
        reminderApi.getAppointmentReminders('ready')
      ]);

      setSession(sessionStatus);
      setMessageQueue(queue);
      setContacts(contactList);
      setSettings(reminderSettings);
      setReminders(pendingReminders);
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const sessionChannel = enhancedWhatsAppClient.subscribeToSessionUpdates((updatedSession) => {
      setSession(updatedSession);
      if (updatedSession.qr_code) {
        setQrCode(updatedSession.qr_code);
      }
    });

    const queueChannel = enhancedWhatsAppClient.subscribeToMessageQueue((message) => {
      setMessageQueue(prev => {
        const existing = prev.find(m => m.id === message.id);
        if (existing) {
          return prev.map(m => m.id === message.id ? message : m);
        }
        return [...prev, message];
      });
    });

    return () => {
      sessionChannel.unsubscribe();
      queueChannel.unsubscribe();
    };
  };

  const handleInitializeSession = async () => {
    setLoading(true);
    try {
      const result = await enhancedWhatsAppClient.initializeSession();
      if (result.success) {
        if (result.qrCode) {
          setQrCode(result.qrCode);
        }
        toast({
          title: "Session Initialized",
          description: "WhatsApp session has been initialized. Please scan the QR code.",
        });
        await loadWhatsAppData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticateSession = async () => {
    setLoading(true);
    try {
      const result = await enhancedWhatsAppClient.authenticateSession();
      if (result.success) {
        toast({
          title: "Session Connected",
          description: "WhatsApp session has been successfully connected!",
        });
        setQrCode(null);
        await loadWhatsAppData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectSession = async () => {
    setLoading(true);
    try {
      const result = await enhancedWhatsAppClient.disconnectSession();
      if (result.success) {
        toast({
          title: "Session Disconnected",
          description: "WhatsApp session has been disconnected.",
        });
        setSession(null);
        setQrCode(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!session?.phone_number) {
      toast({
        title: "No Phone Number",
        description: "Please connect your WhatsApp session first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await enhancedWhatsAppClient.sendMessage(
        session.phone_number,
        "Test message from your salon CRM system! 🎉",
        undefined,
        "test"
      );

      if (result.success) {
        toast({
          title: "Test Message Sent",
          description: "Test message has been sent successfully!",
        });
        await loadWhatsAppData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReminders = async () => {
    setLoading(true);
    try {
      await reminderApi.processReminders();
      await loadWhatsAppData();
      toast({
        title: "Reminders Processed",
        description: "All pending reminders have been processed!",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    if (!session) return 'bg-gray-500';
    if (session.is_connected) return 'bg-green-500';
    if (session.connection_state === 'qr_ready') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConnectionStatusText = () => {
    if (!session) return 'Not Initialized';
    if (session.is_connected) return 'Connected';
    if (session.connection_state === 'qr_ready') return 'Waiting for QR Scan';
    return 'Disconnected';
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access WhatsApp integration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            WhatsApp Web.js Connection
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <p className="text-sm text-gray-600">{getConnectionStatusText()}</p>
              {session?.phone_number && (
                <p className="text-xs text-green-600">Phone: {session.phone_number}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!session?.is_connected ? (
                <Button onClick={handleInitializeSession} disabled={loading}>
                  {loading ? "Initializing..." : "Initialize Session"}
                </Button>
              ) : (
                <Button onClick={handleDisconnectSession} variant="outline" disabled={loading}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>

          {qrCode && !session?.is_connected && (
            <div className="p-4 border rounded-lg text-center">
              <QrCode className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Open WhatsApp on your phone and scan this QR code to connect
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <code className="text-xs break-all">{qrCode}</code>
              </div>
              <Button onClick={handleAuthenticateSession} disabled={loading}>
                {loading ? "Connecting..." : "Complete Authentication"}
              </Button>
            </div>
          )}

          {session?.is_connected && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{session.messages_sent_today}</div>
                <div className="text-xs text-green-700">Messages Today</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{messageQueue.filter(m => m.status === 'pending').length}</div>
                <div className="text-xs text-blue-700">Pending</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{contacts.length}</div>
                <div className="text-xs text-gray-700">Contacts</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Button size="sm" onClick={handleSendTestMessage} disabled={loading}>
                  Send Test
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'connection', label: 'Connection', icon: Smartphone },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'settings', label: 'Settings', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Message Queue */}
      {activeTab === 'messages' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Queue
              <Button onClick={handleProcessReminders} disabled={loading} size="sm">
                <Play className="w-4 h-4 mr-1" />
                Process Reminders
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messageQueue.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages in queue</p>
              ) : (
                messageQueue.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMessageStatusIcon(message.status)}
                      <div>
                        <p className="font-medium">{message.recipient_phone}</p>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {message.message_content}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Priority: {message.priority}</span>
                          <span>Attempts: {message.attempts}/{message.max_attempts}</span>
                          {message.reminder_type && <span>Type: {message.reminder_type}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      message.status === 'sent' ? 'bg-green-100 text-green-800' :
                      message.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      message.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {message.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts Management */}
      {activeTab === 'contacts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              WhatsApp Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No contacts found</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{contact.contact_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{contact.phone_number}</p>
                      {contact.is_business && (
                        <Badge variant="outline" className="text-xs">Business</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.is_blocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => enhancedWhatsAppClient.unblockContact(contact.id)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => enhancedWhatsAppClient.blockContact(contact.id)}
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              WhatsApp Settings & Ban Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Rate Limiting</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Current Limits</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p>• 10 messages per minute</p>
                    <p>• 2-5 second random delays</p>
                    <p>• Human-like behavior patterns</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Security Features</h3>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Protection Active</span>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>• Session monitoring</p>
                    <p>• Automatic reconnection</p>
                    <p>• Error handling & retry logic</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Advanced Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Debug Logging</Label>
                    <p className="text-sm text-gray-600">Log detailed session information</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Reconnect</Label>
                    <p className="text-sm text-gray-600">Automatically reconnect on disconnect</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ban Protection Mode</Label>
                    <p className="text-sm text-gray-600">Extra conservative sending patterns</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Enhanced WhatsApp Integration Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <p><strong>Initialize Session:</strong> Click "Initialize Session" to start the WhatsApp Web.js connection</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <p><strong>Scan QR Code:</strong> Use your phone's WhatsApp to scan the generated QR code</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <p><strong>Auto-Send Messages:</strong> Appointment reminders are sent automatically with ban protection</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <p><strong>Monitor Queue:</strong> Track message delivery status and manage contacts</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg mt-4">
              <p className="text-green-800 font-medium">✅ Ban Protection Features:</p>
              <ul className="list-disc list-inside text-green-700 text-xs mt-2">
                <li>Smart rate limiting (10 messages/minute)</li>
                <li>Random delays between messages (2-5 seconds)</li>
                <li>Human-like behavior simulation</li>
                <li>Session monitoring and auto-recovery</li>
                <li>Contact management and blocking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
