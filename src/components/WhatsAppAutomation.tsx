
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Clock, Settings, Save, MessageSquare, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
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
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadAutomationSettings();
    loadReminderQueue();
  }, []);

  const loadAutomationSettings = async () => {
    try {
      console.log('Loading automation settings...');
      setSaveError(null);
      
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
      setSaveError('Failed to load automation settings. Please try again.');
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
    setSaveError(null);
    
    try {
      console.log('Saving automation settings:', settings);
      
      // Validate settings before saving
      if (!settings.message_template_24h && settings.reminder_24h_enabled) {
        throw new Error('24-hour reminder template cannot be empty when enabled');
      }
      if (!settings.message_template_2h && settings.reminder_2h_enabled) {
        throw new Error('2-hour reminder template cannot be empty when enabled');
      }
      if (!settings.message_template_1h && settings.reminder_1h_enabled) {
        throw new Error('1-hour reminder template cannot be empty when enabled');
      }
      
      await whatsappServerClient.updateAutomationSettings(settings);
      
      toast({
        title: 'Settings Saved',
        description: 'WhatsApp automation settings have been updated successfully!',
        variant: 'default',
      });

      // Reload settings to confirm they were saved
      await loadAutomationSettings();
      
      // Reload queue to see any changes
      loadReminderQueue();
    } catch (error: any) {
      console.error('Error saving automation settings:', error);
      const errorMessage = error.message || 'Failed to save automation settings. Please try again.';
      setSaveError(errorMessage);
      
      toast({
        title: 'Save Failed',
        description: errorMessage,
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
      case 'sent': return 'bg-green-100 text-green-700 border-green-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="w-3 h-3" />;
      case 'failed': return <AlertCircle className="w-3 h-3" />;
      case 'processing': return <RefreshCw className="w-3 h-3 animate-spin" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {saveError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {saveError}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Automation Settings */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Settings className="h-5 w-5 text-purple-600" />
            WhatsApp Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Enable/Disable */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <h3 className="font-medium text-gray-800">Enable WhatsApp Automation</h3>
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
                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Reminder Types
                </h3>

                {/* 24 Hour Reminder */}
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder_24h" className="text-gray-700">24 Hours Before Appointment</Label>
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
                      className="bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                    />
                  )}
                </div>

                {/* 2 Hour Reminder */}
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder_2h" className="text-gray-700">2 Hours Before Appointment</Label>
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
                      className="bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                    />
                  )}
                </div>

                {/* 1 Hour Reminder */}
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder_1h" className="text-gray-700">1 Hour Before Appointment</Label>
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
                      className="bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                    />
                  )}
                </div>
              </div>

              {/* Follow-up Settings */}
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="follow_up" className="text-gray-700">Follow-up Messages</Label>
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
                    className="bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                  />
                )}
              </div>

              {/* Template Variables Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Available Variables:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><code className="bg-blue-100 px-1 rounded">{'{clientName}'}</code> - Client's name</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{service}'}</code> - Appointment service</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{time}'}</code> - Appointment time</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{date}'}</code> - Appointment date</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{salonName}'}</code> - Your salon name</p>
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={saveAutomationSettings} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Automation Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Reminder Queue Status */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Reminder Queue Status
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadReminderQueue} disabled={loadingQueue} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-1 ${loadingQueue ? 'animate-spin' : ''}`} />
              {loadingQueue ? 'Loading...' : 'Refresh'}
            </Button>
            <Button onClick={processQueue} variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
              Process Queue
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reminderQueue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reminders in queue</p>
              <p className="text-sm mt-1">Reminders will appear here when appointments are scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminderQueue.slice(0, 10).map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{reminder.client_name}</p>
                    <p className="text-sm text-gray-600">{reminder.reminder_type} reminder</p>
                    <p className="text-xs text-gray-500">
                      Scheduled: {new Date(reminder.scheduled_time).toLocaleString()}
                    </p>
                    {reminder.error_message && (
                      <p className="text-xs text-red-600 mt-1">Error: {reminder.error_message}</p>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(reminder.status)} flex items-center gap-1`}>
                    {getStatusIcon(reminder.status)}
                    {reminder.status}
                  </Badge>
                </div>
              ))}
              {reminderQueue.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2 border-t">
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
