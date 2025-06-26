
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, Settings, Save, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { whatsappServerClient } from '@/services/whatsappServerClient';

interface AutomationSettings {
  is_enabled: boolean;
  reminder_24h_enabled: boolean;
  reminder_2h_enabled: boolean;
  reminder_1h_enabled: boolean;
  message_template_24h: string;
  message_template_2h: string;
  message_template_1h: string;
  follow_up_enabled: boolean;
  follow_up_template: string;
  follow_up_delay_hours: number;
}

const defaultSettings: AutomationSettings = {
  is_enabled: true,
  reminder_24h_enabled: true,
  reminder_2h_enabled: false,
  reminder_1h_enabled: false,
  message_template_24h: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at {salonName}!',
  message_template_2h: 'Hi {clientName}! Your {service} appointment is in 2 hours at {time}. See you soon at {salonName}!',
  message_template_1h: 'Hi {clientName}! Your {service} appointment is in 1 hour at {time}. We\'re ready for you at {salonName}!',
  follow_up_enabled: false,
  follow_up_template: 'Hi {clientName}! How was your {service} appointment? We\'d love your feedback!',
  follow_up_delay_hours: 2
};

export const WhatsAppAutomation: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [reminderQueue, setReminderQueue] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  useEffect(() => {
    loadAutomationSettings();
    loadReminderQueue();
  }, []);

  const loadAutomationSettings = async () => {
    try {
      console.log('Loading automation settings...');
      const data = await whatsappServerClient.getAutomationSettings();
      
      if (data) {
        console.log('Loaded settings:', data);
        setSettings({
          is_enabled: data.is_enabled ?? defaultSettings.is_enabled,
          reminder_24h_enabled: data.reminder_24h_enabled ?? defaultSettings.reminder_24h_enabled,
          reminder_2h_enabled: data.reminder_2h_enabled ?? defaultSettings.reminder_2h_enabled,
          reminder_1h_enabled: data.reminder_1h_enabled ?? defaultSettings.reminder_1h_enabled,
          message_template_24h: data.message_template_24h || defaultSettings.message_template_24h,
          message_template_2h: data.message_template_2h || defaultSettings.message_template_2h,
          message_template_1h: data.message_template_1h || defaultSettings.message_template_1h,
          follow_up_enabled: data.follow_up_enabled ?? defaultSettings.follow_up_enabled,
          follow_up_template: data.follow_up_template || defaultSettings.follow_up_template,
          follow_up_delay_hours: data.follow_up_delay_hours ?? defaultSettings.follow_up_delay_hours
        });
      } else {
        console.log('No existing settings found, using defaults');
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation settings.',
        variant: 'destructive',
      });
    }
  };

  const loadReminderQueue = async () => {
    setLoadingQueue(true);
    try {
      const queue = await whatsappServerClient.getReminderQueue();
      setReminderQueue(queue);
    } catch (error) {
      console.error('Error loading reminder queue:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const saveAutomationSettings = async () => {
    setLoading(true);
    try {
      console.log('Saving automation settings:', settings);
      await whatsappServerClient.updateAutomationSettings(settings);
      
      toast({
        title: 'Settings Saved',
        description: 'WhatsApp automation settings have been updated successfully!',
        variant: 'default',
      });

      // Reload queue to see any changes
      loadReminderQueue();
    } catch (error) {
      console.error('Error saving automation settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save automation settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    try {
      const result = await whatsappServerClient.processQueue();
      toast({
        title: 'Queue Processed',
        description: `Processed ${result.processed} reminders. ${result.failed} failed.`,
      });
      loadReminderQueue();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process reminder queue.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Enable/Disable */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
            <div>
              <h3 className="font-medium">Enable WhatsApp Automation</h3>
              <p className="text-sm text-gray-600">Automatically send appointment reminders and follow-ups</p>
            </div>
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_enabled: checked }))}
            />
          </div>

          {settings.is_enabled && (
            <>
              {/* Reminder Settings */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reminder Types
                </h3>

                {/* 24 Hour Reminder */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder_24h">24 Hours Before Appointment</Label>
                    <Switch
                      id="reminder_24h"
                      checked={settings.reminder_24h_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_24h_enabled: checked }))}
                    />
                  </div>
                  {settings.reminder_24h_enabled && (
                    <Textarea
                      value={settings.message_template_24h}
                      onChange={(e) => setSettings(prev => ({ ...prev, message_template_24h: e.target.value }))}
                      placeholder="24h reminder message template"
                      rows={2}
                    />
                  )}
                </div>

                {/* 2 Hour Reminder */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder_2h">2 Hours Before Appointment</Label>
                    <Switch
                      id="reminder_2h"
                      checked={settings.reminder_2h_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_2h_enabled: checked }))}
                    />
                  </div>
                  {settings.reminder_2h_enabled && (
                    <Textarea
                      value={settings.message_template_2h}
                      onChange={(e) => setSettings(prev => ({ ...prev, message_template_2h: e.target.value }))}
                      placeholder="2h reminder message template"
                      rows={2}
                    />
                  )}
                </div>

                {/* 1 Hour Reminder */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder_1h">1 Hour Before Appointment</Label>
                    <Switch
                      id="reminder_1h"
                      checked={settings.reminder_1h_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_1h_enabled: checked }))}
                    />
                  </div>
                  {settings.reminder_1h_enabled && (
                    <Textarea
                      value={settings.message_template_1h}
                      onChange={(e) => setSettings(prev => ({ ...prev, message_template_1h: e.target.value }))}
                      placeholder="1h reminder message template"
                      rows={2}
                    />
                  )}
                </div>
              </div>

              {/* Follow-up Settings */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="follow_up">Follow-up Messages</Label>
                    <p className="text-sm text-gray-600">Send feedback requests after appointments</p>
                  </div>
                  <Switch
                    id="follow_up"
                    checked={settings.follow_up_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, follow_up_enabled: checked }))}
                  />
                </div>
                {settings.follow_up_enabled && (
                  <Textarea
                    value={settings.follow_up_template}
                    onChange={(e) => setSettings(prev => ({ ...prev, follow_up_template: e.target.value }))}
                    placeholder="Follow-up message template"
                    rows={2}
                  />
                )}
              </div>

              {/* Template Variables Info */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Available Variables:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><code>{'{clientName}'}</code> - Client's name</p>
                  <p><code>{'{service}'}</code> - Appointment service</p>
                  <p><code>{'{time}'}</code> - Appointment time</p>
                  <p><code>{'{date}'}</code> - Appointment date</p>
                  <p><code>{'{salonName}'}</code> - Your salon name</p>
                </div>
              </div>
            </>
          )}

          <Button onClick={saveAutomationSettings} disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Automation Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Reminder Queue Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reminder Queue
          </CardTitle>
          <Button onClick={loadReminderQueue} disabled={loadingQueue} variant="outline" size="sm">
            {loadingQueue ? 'Loading...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {reminderQueue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reminders in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminderQueue.slice(0, 10).map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{reminder.client_name}</p>
                    <p className="text-sm text-gray-600">{reminder.reminder_type} reminder</p>
                    <p className="text-xs text-gray-500">
                      Scheduled: {new Date(reminder.scheduled_time).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(reminder.status)}>
                    {reminder.status}
                  </Badge>
                </div>
              ))}
              {reminderQueue.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  ...and {reminderQueue.length - 10} more reminders
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
