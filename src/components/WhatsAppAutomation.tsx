
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, MessageSquare, Users, Zap, Settings, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AutomationSettings {
  id?: string;
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

interface QueueStats {
  pending: number;
  sent: number;
  failed: number;
}

export const WhatsAppAutomation: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AutomationSettings>({
    is_enabled: true,
    reminder_24h_enabled: true,
    reminder_2h_enabled: false,
    reminder_1h_enabled: false,
    message_template_24h: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at {salonName}!',
    message_template_2h: 'Hi {clientName}! Your {service} appointment is in 2 hours at {time}. See you soon at {salonName}!',
    message_template_1h: 'Hi {clientName}! Your {service} appointment is in 1 hour at {time}. We\'re ready for you at {salonName}!',
    follow_up_enabled: false,
    follow_up_template: 'Hi {clientName}! How was your {service} appointment? We\'d love your feedback!',
    follow_up_delay_hours: 2,
  });
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, sent: 0, failed: 0 });

  useEffect(() => {
    if (user) {
      loadAutomationSettings();
      loadQueueStats();
    }
  }, [user]);

  const loadAutomationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_automation_settings')
        .select('*')
        .eq('salon_id', user?.id)
        .single();
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
    }
  };

  const loadQueueStats = async () => {
    try {
      const { data: pending } = await supabase
        .from('whatsapp_reminder_queue')
        .select('id', { count: 'exact' })
        .eq('salon_id', user?.id)
        .eq('status', 'pending');

      const { data: sent } = await supabase
        .from('whatsapp_reminder_queue')
        .select('id', { count: 'exact' })
        .eq('salon_id', user?.id)
        .eq('status', 'sent');

      const { data: failed } = await supabase
        .from('whatsapp_reminder_queue')
        .select('id', { count: 'exact' })
        .eq('salon_id', user?.id)
        .eq('status', 'failed');

      setQueueStats({
        pending: pending?.length || 0,
        sent: sent?.length || 0,
        failed: failed?.length || 0,
      });
    } catch (error) {
      console.error('Error loading queue stats:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_automation_settings')
        .upsert({
          ...settings,
          salon_id: user?.id,
        }, { onConflict: 'salon_id' });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "WhatsApp automation settings updated successfully!",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save automation settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-web-enhanced', {
        body: { action: 'process_queue' }
      });

      if (error) throw error;

      toast({
        title: "Queue Processed",
        description: `Processed ${data.processed_count} reminders from queue.`,
      });

      loadQueueStats();
    } catch (error) {
      console.error('Error processing queue:', error);
      toast({
        title: "Error",
        description: "Failed to process reminder queue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Automation Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${settings.is_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">{settings.is_enabled ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{queueStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold text-green-600">{queueStats.sent}</p>
              </div>
              <Send className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.failed}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Enable WhatsApp Automation</h3>
              <p className="text-sm text-gray-600">Automatically send appointment reminders</p>
            </div>
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_enabled: checked }))}
            />
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Reminder Types</h3>
            
            {/* 24 Hour Reminder */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">24 Hour Reminder</h4>
                  <p className="text-sm text-gray-600">Send reminder 1 day before appointment</p>
                </div>
                <Switch
                  checked={settings.reminder_24h_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_24h_enabled: checked }))}
                />
              </div>
              {settings.reminder_24h_enabled && (
                <div>
                  <Label htmlFor="template_24h">Message Template</Label>
                  <Textarea
                    id="template_24h"
                    value={settings.message_template_24h}
                    onChange={(e) => setSettings(prev => ({ ...prev, message_template_24h: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* 2 Hour Reminder */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">2 Hour Reminder</h4>
                  <p className="text-sm text-gray-600">Send reminder 2 hours before appointment</p>
                </div>
                <Switch
                  checked={settings.reminder_2h_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_2h_enabled: checked }))}
                />
              </div>
              {settings.reminder_2h_enabled && (
                <div>
                  <Label htmlFor="template_2h">Message Template</Label>
                  <Textarea
                    id="template_2h"
                    value={settings.message_template_2h}
                    onChange={(e) => setSettings(prev => ({ ...prev, message_template_2h: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* 1 Hour Reminder */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">1 Hour Reminder</h4>
                  <p className="text-sm text-gray-600">Send reminder 1 hour before appointment</p>
                </div>
                <Switch
                  checked={settings.reminder_1h_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_1h_enabled: checked }))}
                />
              </div>
              {settings.reminder_1h_enabled && (
                <div>
                  <Label htmlFor="template_1h">Message Template</Label>
                  <Textarea
                    id="template_1h"
                    value={settings.message_template_1h}
                    onChange={(e) => setSettings(prev => ({ ...prev, message_template_1h: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Settings */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Follow-up Messages</h4>
                <p className="text-sm text-gray-600">Send feedback requests after appointments</p>
              </div>
              <Switch
                checked={settings.follow_up_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, follow_up_enabled: checked }))}
              />
            </div>
            {settings.follow_up_enabled && (
              <div>
                <Label htmlFor="follow_up_template">Follow-up Template</Label>
                <Textarea
                  id="follow_up_template"
                  value={settings.follow_up_template}
                  onChange={(e) => setSettings(prev => ({ ...prev, follow_up_template: e.target.value }))}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Template Variables */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Available Variables</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Badge variant="outline">{'{clientName}'}</Badge>
              <Badge variant="outline">{'{service}'}</Badge>
              <Badge variant="outline">{'{time}'}</Badge>
              <Badge variant="outline">{'{date}'}</Badge>
              <Badge variant="outline">{'{salonName}'}</Badge>
              <Badge variant="outline">{'{staffName}'}</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={saveSettings} disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Settings"}
            </Button>
            <Button 
              variant="outline" 
              onClick={processQueue} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Process Queue ({queueStats.pending})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
