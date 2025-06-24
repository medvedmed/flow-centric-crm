
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PhoneWhatsAppClient } from './PhoneWhatsAppClient';

interface AutomationSettings {
  autoSend: boolean;
  optimalSendTime: string;
  followUpEnabled: boolean;
  followUpTemplate: string;
  reminderTiming: '24_hours' | '2_hours';
  messageTemplate: string;
}

export const WhatsAppIntegration: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AutomationSettings>({
    autoSend: false,
    optimalSendTime: '10:00',
    followUpEnabled: false,
    followUpTemplate: 'Hi {clientName}! How was your {service} appointment? We\'d love your feedback!',
    reminderTiming: '24_hours',
    messageTemplate: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!'
  });

  useEffect(() => {
    loadAutomationSettings();
  }, []);

  const loadAutomationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .single();
      
      if (data) {
        setSettings({
          autoSend: data.auto_send || false,
          optimalSendTime: data.optimal_send_time || '10:00',
          followUpEnabled: data.follow_up_enabled || false,
          followUpTemplate: data.follow_up_template || settings.followUpTemplate,
          reminderTiming: (data.reminder_timing as '24_hours' | '2_hours') || '24_hours',
          messageTemplate: data.message_template || settings.messageTemplate
        });
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
    }
  };

  const saveAutomationSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reminder_settings')
        .upsert({
          salon_id: user.id,
          auto_send: settings.autoSend,
          optimal_send_time: settings.optimalSendTime,
          follow_up_enabled: settings.followUpEnabled,
          follow_up_template: settings.followUpTemplate,
          reminder_timing: settings.reminderTiming,
          message_template: settings.messageTemplate,
          is_enabled: true
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "WhatsApp automation settings updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save automation settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone-based WhatsApp Connection */}
      <PhoneWhatsAppClient />

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Send Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Automatic Message Sending</h3>
              <p className="text-sm text-gray-600">Send reminders automatically at optimal times</p>
            </div>
            <Switch
              checked={settings.autoSend}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSend: checked }))}
            />
          </div>

          {/* Timing Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reminderTiming">Reminder Timing</Label>
              <select
                id="reminderTiming"
                value={settings.reminderTiming}
                onChange={(e) => setSettings(prev => ({ ...prev, reminderTiming: e.target.value as '24_hours' | '2_hours' }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="24_hours">24 Hours Before</option>
                <option value="2_hours">2 Hours Before</option>
              </select>
            </div>
            <div>
              <Label htmlFor="optimalTime">Optimal Send Time</Label>
              <Input
                id="optimalTime"
                type="time"
                value={settings.optimalSendTime}
                onChange={(e) => setSettings(prev => ({ ...prev, optimalSendTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Message Template */}
          <div>
            <Label htmlFor="messageTemplate">Reminder Message Template</Label>
            <Textarea
              id="messageTemplate"
              value={settings.messageTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, messageTemplate: e.target.value }))}
              placeholder="Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{clientName}'}, {'{service}'}, {'{time}'}, {'{date}'}
            </p>
          </div>

          {/* Follow-up Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Follow-up Messages</h3>
                <p className="text-sm text-gray-600">Send feedback requests after appointments</p>
              </div>
              <Switch
                checked={settings.followUpEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, followUpEnabled: checked }))}
              />
            </div>

            {settings.followUpEnabled && (
              <div>
                <Label htmlFor="followUpTemplate">Follow-up Message Template</Label>
                <Textarea
                  id="followUpTemplate"
                  value={settings.followUpTemplate}
                  onChange={(e) => setSettings(prev => ({ ...prev, followUpTemplate: e.target.value }))}
                  rows={3}
                />
              </div>
            )}
          </div>

          <Button onClick={saveAutomationSettings} disabled={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Automation Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How WhatsApp Integration Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <p>Enter your WhatsApp Business phone number to get started</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <p>Verify your phone number with the code sent to your WhatsApp</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <p>Configure your message templates and automation preferences</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <p>Messages will be sent automatically from your WhatsApp Business account</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
