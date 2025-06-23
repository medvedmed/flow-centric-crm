
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
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle, ExternalLink, Play, AlertCircle } from 'lucide-react';
import { reminderApi } from '@/services/api/reminderApi';
import { ReminderSettings, AppointmentReminder } from '@/services/types';
import { RealWhatsAppClient } from './RealWhatsAppClient';
import { whatsappClient } from '@/services/whatsappClient';

export const WhatsAppSection: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingReminders, setProcessingReminders] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  
  const [formData, setFormData] = useState({
    reminderTiming: '24_hours' as '24_hours' | '2_hours',
    isEnabled: true,
    messageTemplate: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!'
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadReminderSettings();
      loadPendingReminders();
      checkWhatsAppConnection();
    }
  }, [isAuthenticated, user]);

  const checkWhatsAppConnection = async () => {
    try {
      const session = await whatsappClient.getSession();
      setWhatsappConnected(session?.is_connected || false);
    } catch (error) {
      console.error('Error checking WhatsApp connection:', error);
    }
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

    if (!whatsappConnected) {
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
    try {
      // Extract phone number from reminder (you might need to adjust this based on your data structure)
      const phoneNumber = reminder.whatsappUrl?.match(/phone=([^&]+)/)?.[1] || '';
      
      if (!phoneNumber) {
        toast({
          title: "Error",
          description: "No phone number found for this reminder",
          variant: "destructive",
        });
        return;
      }

      // Send message using WhatsApp client
      await whatsappClient.sendMessage(
        phoneNumber,
        'Your appointment reminder message here', // You can customize this
        reminder.appointmentId
      );

      // Update reminder status
      await reminderApi.updateReminderStatus(reminder.id, 'sent');
      await loadPendingReminders();
      
      toast({
        title: "Message Sent",
        description: "WhatsApp reminder sent successfully!",
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Failed to send WhatsApp message",
        variant: "destructive",
      });
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
      {/* Real WhatsApp Client Connection */}
      <RealWhatsAppClient />

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
              Click below to check for appointments that need reminders and send WhatsApp messages automatically.
            </p>
            <Button 
              onClick={handleProcessReminders} 
              disabled={processingReminders || !formData.isEnabled || !whatsappConnected}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {processingReminders ? "Processing..." : "Process Reminders Now"}
            </Button>
            {!whatsappConnected && (
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
                          disabled={!whatsappConnected}
                        >
                          <Send className="w-3 h-3 mr-1" />
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
          <CardTitle>How the Real WhatsApp Integration Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Connect your WhatsApp:</strong> Scan the QR code with your phone to link your WhatsApp account</p>
            <p>2. <strong>Configure reminders:</strong> Set your preferred timing and customize message templates</p>
            <p>3. <strong>Automatic processing:</strong> The system checks for upcoming appointments and creates reminders</p>
            <p>4. <strong>Real sending:</strong> Messages are sent directly from your connected WhatsApp account</p>
            <p>5. <strong>Message tracking:</strong> Monitor delivery status and message history</p>
            <p className="text-blue-600 font-medium">💡 All messages appear to come from your personal WhatsApp number, building trust with clients</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
