
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle, ExternalLink, Play, AlertCircle, QrCode, Smartphone } from 'lucide-react';
import { reminderApi } from '@/services/api/reminderApi';
import { ReminderSettings, AppointmentReminder } from '@/services/types';

interface WhatsAppSession {
  isConnected: boolean;
  phoneNumber?: string;
  lastConnectedAt?: string;
}

export const WhatsAppSection: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingReminders, setProcessingReminders] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [whatsappSession, setWhatsappSession] = useState<WhatsAppSession>({ isConnected: false });
  const [showQRCode, setShowQRCode] = useState(false);
  const [connectingWhatsApp, setConnectingWhatsApp] = useState(false);
  
  const [formData, setFormData] = useState({
    reminderTiming: '24_hours' as '24_hours' | '2_hours',
    isEnabled: true,
    messageTemplate: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!'
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadReminderSettings();
      loadPendingReminders();
      loadWhatsAppSession();
    }
  }, [isAuthenticated, user]);

  const loadWhatsAppSession = async () => {
    // Mock loading WhatsApp session - in real implementation, this would check actual WhatsApp Web session
    setWhatsappSession({
      isConnected: false,
      phoneNumber: undefined,
      lastConnectedAt: undefined
    });
  };

  const connectWhatsApp = async () => {
    setConnectingWhatsApp(true);
    setShowQRCode(true);
    
    try {
      // Simulate QR code connection process
      // In real implementation, this would:
      // 1. Generate QR code for WhatsApp Web
      // 2. Wait for user to scan with their phone
      // 3. Establish WhatsApp Web session
      
      setTimeout(() => {
        setWhatsappSession({
          isConnected: true,
          phoneNumber: '+1234567890', // This would come from actual WhatsApp session
          lastConnectedAt: new Date().toISOString()
        });
        setShowQRCode(false);
        setConnectingWhatsApp(false);
        
        toast({
          title: "WhatsApp Connected!",
          description: "Your WhatsApp account is now connected to send reminders.",
        });
      }, 3000);
    } catch (error) {
      setConnectingWhatsApp(false);
      setShowQRCode(false);
      toast({
        title: "Connection Failed",
        description: "Failed to connect WhatsApp. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWhatsApp = () => {
    setWhatsappSession({ isConnected: false });
    toast({
      title: "WhatsApp Disconnected",
      description: "Your WhatsApp account has been disconnected.",
    });
  };

  const loadReminderSettings = async () => {
    try {
      const data = await reminderApi.getReminderSettings();
      if (data) {
        setSettings(data);
        setFormData({
          reminderTiming: data.reminderTiming,
          isEnabled: data.isEnabled,
          messageTemplate: data.messageTemplate
        });
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to load reminder settings",
        variant: "destructive",
      });
    }
  };

  const loadPendingReminders = async () => {
    try {
      const data = await reminderApi.getAppointmentReminders('ready');
      setReminders(data);
    } catch (error) {
      console.error('Error loading pending reminders:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (settings) {
        await reminderApi.updateReminderSettings(formData);
      } else {
        await reminderApi.createReminderSettings(formData);
      }
      
      await loadReminderSettings();
      toast({
        title: "Success",
        description: "Reminder settings updated successfully!",
      });
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reminder settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReminders = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process reminders",
        variant: "destructive",
      });
      return;
    }

    if (!whatsappSession.isConnected) {
      toast({
        title: "WhatsApp Not Connected",
        description: "Please connect your WhatsApp account first to send reminders.",
        variant: "destructive",
      });
      return;
    }

    setProcessingReminders(true);
    try {
      await reminderApi.processReminders();
      await loadPendingReminders();
      toast({
        title: "Success",
        description: "Reminders processed successfully!",
      });
    } catch (error) {
      console.error('Process reminders error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process reminders",
        variant: "destructive",
      });
    } finally {
      setProcessingReminders(false);
    }
  };

  const handleSendReminder = async (reminder: AppointmentReminder) => {
    if (reminder.whatsappUrl) {
      // Open WhatsApp Web with the pre-filled message
      window.open(reminder.whatsappUrl, '_blank');
      
      try {
        await reminderApi.updateReminderStatus(reminder.id, 'sent');
        await loadPendingReminders();
        toast({
          title: "Reminder Sent",
          description: "WhatsApp reminder opened successfully!",
        });
      } catch (error) {
        console.error('Error updating reminder status:', error);
      }
    }
  };

  const handleSkipReminder = async (reminder: AppointmentReminder) => {
    try {
      await reminderApi.updateReminderStatus(reminder.id, 'skipped');
      await loadPendingReminders();
      toast({
        title: "Reminder Skipped",
        description: "Reminder has been marked as skipped",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip reminder",
        variant: "destructive",
      });
    }
  };

  // Show authentication warning if not logged in
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access WhatsApp integration settings.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${whatsappSession.isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <div>
                <p className="font-medium">
                  {whatsappSession.isConnected ? 'Connected' : 'Not Connected'}
                </p>
                {whatsappSession.phoneNumber && (
                  <p className="text-sm text-gray-600">{whatsappSession.phoneNumber}</p>
                )}
              </div>
            </div>
            <Badge variant={whatsappSession.isConnected ? 'default' : 'secondary'}>
              {whatsappSession.isConnected ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {!whatsappSession.isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect your WhatsApp account by scanning the QR code with WhatsApp on your phone.
              </p>
              <Button 
                onClick={connectWhatsApp} 
                disabled={connectingWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {connectingWhatsApp ? "Connecting..." : "Connect WhatsApp"}
              </Button>
              
              {showQRCode && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Scan this QR code with WhatsApp on your phone
                  </p>
                  <p className="text-xs text-gray-500">
                    Go to WhatsApp → Settings → Linked Devices → Link a Device
                  </p>
                  <div className="mt-4">
                    <div className="animate-pulse text-blue-600 text-sm">
                      Waiting for scan...
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">WhatsApp Connected Successfully</span>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWhatsApp}>
                  Disconnect
                </Button>
              </div>
              {whatsappSession.lastConnectedAt && (
                <p className="text-xs text-gray-500">
                  Connected: {new Date(whatsappSession.lastConnectedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Reminder Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${formData.isEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="font-medium">
                {formData.isEnabled ? 'Automatic Reminders Enabled' : 'Automatic Reminders Disabled'}
              </span>
            </div>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          <div>
            <Label htmlFor="reminderTiming">Reminder Timing</Label>
            <select
              id="reminderTiming"
              value={formData.reminderTiming}
              onChange={(e) => setFormData(prev => ({ ...prev, reminderTiming: e.target.value as '24_hours' | '2_hours' }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="24_hours">24 Hours Before Appointment</option>
              <option value="2_hours">2 Hours Before Appointment</option>
            </select>
          </div>

          <div>
            <Label htmlFor="messageTemplate">Message Template</Label>
            <Textarea
              id="messageTemplate"
              value={formData.messageTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, messageTemplate: e.target.value }))}
              placeholder="Use {clientName}, {service}, {time}, {date} as placeholders"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Available placeholders: {'{clientName}'}, {'{service}'}, {'{time}'}, {'{date}'}
            </p>
          </div>

          <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Process Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Process Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click below to check for appointments that need reminders and generate WhatsApp messages.
            </p>
            <Button 
              onClick={handleProcessReminders} 
              disabled={processingReminders || !formData.isEnabled || !whatsappSession.isConnected}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {processingReminders ? "Processing..." : "Process Reminders Now"}
            </Button>
            {!whatsappSession.isConnected && (
              <p className="text-xs text-orange-600">
                Connect WhatsApp first to process reminders
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Reminders */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Ready to Send ({reminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(reminder.status)}
                    <div>
                      <p className="font-medium">Appointment Reminder</p>
                      <p className="text-sm text-gray-600">
                        Scheduled: {new Date(reminder.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(reminder.status)}>
                      {reminder.status.toUpperCase()}
                    </Badge>
                    {reminder.status === 'ready' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSendReminder(reminder)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSkipReminder(reminder)}
                        >
                          Skip
                        </Button>
                      </div>
                    )}
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
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Connect your WhatsApp account by scanning the QR code</p>
            <p>2. Enable automatic reminders and choose your preferred timing</p>
            <p>3. Customize your message template with client and appointment details</p>
            <p>4. Click "Process Reminders Now" to generate messages for upcoming appointments</p>
            <p>5. Click "Send" to open WhatsApp with the pre-filled message</p>
            <p>6. Send the message directly from your WhatsApp account</p>
            <p className="text-blue-600 font-medium">💡 Your salon's WhatsApp will be used to send all reminders</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
