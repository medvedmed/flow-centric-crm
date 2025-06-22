
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle, ExternalLink, Play } from 'lucide-react';
import { reminderApi } from '@/services/api/reminderApi';
import { ReminderSettings, AppointmentReminder } from '@/services/types';

export const WhatsAppSection: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingReminders, setProcessingReminders] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [reminders, setReminders] = useState<AppointmentReminder[]>([]);
  
  const [formData, setFormData] = useState({
    reminderTiming: '24_hours' as '24_hours' | '2_hours',
    isEnabled: true,
    messageTemplate: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!'
  });

  useEffect(() => {
    loadReminderSettings();
    loadPendingReminders();
  }, []);

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
      toast({
        title: "Error",
        description: "Failed to update reminder settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReminders = async () => {
    setProcessingReminders(true);
    try {
      await reminderApi.processReminders();
      await loadPendingReminders();
      toast({
        title: "Success",
        description: "Reminders processed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process reminders",
        variant: "destructive",
      });
    } finally {
      setProcessingReminders(false);
    }
  };

  const handleSendReminder = async (reminder: AppointmentReminder) => {
    if (reminder.whatsappUrl) {
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
              Click below to check for appointments that need reminders and generate WhatsApp links.
            </p>
            <Button 
              onClick={handleProcessReminders} 
              disabled={processingReminders || !formData.isEnabled}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {processingReminders ? "Processing..." : "Process Reminders Now"}
            </Button>
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
            <p>1. Enable automatic reminders and choose your preferred timing (24 hours or 2 hours before appointments)</p>
            <p>2. Customize your message template with client and appointment details</p>
            <p>3. Click "Process Reminders Now" to generate WhatsApp links for upcoming appointments</p>
            <p>4. Click "Send" to open WhatsApp with the pre-filled message</p>
            <p>5. Send the message directly from your WhatsApp account</p>
            <p className="text-blue-600 font-medium">💡 Pro tip: Set up a daily routine to process and send reminders!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
