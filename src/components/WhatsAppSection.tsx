
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface WhatsAppReminder {
  id: string;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
}

export const WhatsAppSection: React.FC = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [autoReminders, setAutoReminders] = useState(true);
  const [reminderTemplate, setReminderTemplate] = useState(
    'Hi {clientName}! This is a reminder for your appointment tomorrow at {time}. See you at the salon!'
  );

  // Mock data for sent reminders
  const [sentReminders] = useState<WhatsAppReminder[]>([
    {
      id: '1',
      clientName: 'Alice Smith',
      clientPhone: '+1-555-0123',
      appointmentDate: '2024-06-23',
      appointmentTime: '10:00 AM',
      sentAt: '2024-06-22 18:30',
      status: 'sent'
    },
    {
      id: '2',
      clientName: 'Bob Wilson',
      clientPhone: '+1-555-0456',
      appointmentDate: '2024-06-23',
      appointmentTime: '2:00 PM',
      sentAt: '2024-06-22 18:31',
      status: 'sent'
    },
    {
      id: '3',
      clientName: 'Carol Brown',
      clientPhone: '+1-555-0789',
      appointmentDate: '2024-06-23',
      appointmentTime: '11:00 AM',
      sentAt: '2024-06-22 18:32',
      status: 'failed'
    }
  ]);

  const handleConnect = () => {
    if (!apiKey || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter both API key and phone number",
        variant: "destructive",
      });
      return;
    }

    // Simulate connection
    setIsConnected(true);
    toast({
      title: "WhatsApp Connected",
      description: "Successfully connected to WhatsApp API",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    setPhoneNumber('');
    toast({
      title: "WhatsApp Disconnected",
      description: "WhatsApp integration has been disabled",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isConnected ? 'Connected to WhatsApp' : 'Not Connected'}
              </span>
            </div>
            {isConnected && (
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </div>

          {!isConnected && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">WhatsApp API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your WhatsApp API key"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Business Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1-555-123-4567"
                />
              </div>
              <Button onClick={handleConnect} className="w-full">
                Connect WhatsApp
              </Button>
            </div>
          )}

          {isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoReminders">Automatic Reminders</Label>
                <Switch
                  id="autoReminders"
                  checked={autoReminders}
                  onCheckedChange={setAutoReminders}
                />
              </div>
              <div>
                <Label htmlFor="reminderTemplate">Reminder Message Template</Label>
                <textarea
                  id="reminderTemplate"
                  className="w-full p-3 border rounded-md resize-none"
                  rows={3}
                  value={reminderTemplate}
                  onChange={(e) => setReminderTemplate(e.target.value)}
                  placeholder="Use {clientName}, {time}, {date} as placeholders"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available placeholders: {'{clientName}'}, {'{time}'}, {'{date}'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Reminders */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Sent Reminders Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(reminder.status)}
                    <div>
                      <p className="font-medium">{reminder.clientName}</p>
                      <p className="text-sm text-gray-600">
                        {reminder.appointmentDate} at {reminder.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(reminder.status)}>
                      {reminder.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Sent: {reminder.sentAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Sign up for a WhatsApp Business API account</p>
            <p>2. Get your API key from your WhatsApp provider</p>
            <p>3. Verify your business phone number</p>
            <p>4. Enter your credentials above to connect</p>
            <p>5. Automatic reminders will be sent 24 hours before appointments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
