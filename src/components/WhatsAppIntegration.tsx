
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Smartphone, QrCode, CheckCircle, AlertCircle, Send, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppSession {
  id: string;
  isConnected: boolean;
  phoneNumber?: string;
  lastConnectedAt?: string;
}

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
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [settings, setSettings] = useState<AutomationSettings>({
    autoSend: false,
    optimalSendTime: '10:00',
    followUpEnabled: false,
    followUpTemplate: 'Hi {clientName}! How was your {service} appointment? We\'d love your feedback!',
    reminderTiming: '24_hours',
    messageTemplate: 'Hi {clientName}! This is a reminder for your {service} appointment tomorrow at {time}. See you at the salon!'
  });

  useEffect(() => {
    loadWhatsAppSession();
    loadAutomationSettings();
  }, []);

  const loadWhatsAppSession = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .single();
      
      if (data) {
        setSession({
          id: data.id,
          isConnected: data.is_connected,
          phoneNumber: data.phone_number,
          lastConnectedAt: data.last_connected_at
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp session:', error);
    }
  };

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
          reminderTiming: data.reminder_timing || '24_hours',
          messageTemplate: data.message_template || settings.messageTemplate
        });
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
    }
  };

  const connectWhatsApp = async () => {
    setLoading(true);
    setShowQR(true);
    
    try {
      // Simulate QR code generation and connection process
      // In a real implementation, this would connect to WhatsApp Web API
      setTimeout(() => {
        setSession({
          id: 'temp-id',
          isConnected: true,
          phoneNumber: '+1234567890',
          lastConnectedAt: new Date().toISOString()
        });
        setShowQR(false);
        toast({
          title: "WhatsApp Connected!",
          description: "Your WhatsApp account is now connected to the CRM.",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      await supabase
        .from('whatsapp_sessions')
        .update({ is_connected: false })
        .eq('id', session?.id);
      
      setSession(prev => prev ? { ...prev, isConnected: false } : null);
      
      toast({
        title: "WhatsApp Disconnected",
        description: "Your WhatsApp account has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp.",
        variant: "destructive",
      });
    }
  };

  const saveAutomationSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reminder_settings')
        .upsert({
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
      {/* Connection Status */}
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
              <div className={`w-3 h-3 rounded-full ${session?.isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <div>
                <p className="font-medium">
                  {session?.isConnected ? 'Connected' : 'Not Connected'}
                </p>
                {session?.phoneNumber && (
                  <p className="text-sm text-gray-600">{session.phoneNumber}</p>
                )}
              </div>
            </div>
            <Badge variant={session?.isConnected ? 'default' : 'secondary'}>
              {session?.isConnected ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {!session?.isConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect your personal WhatsApp account to send automated messages directly from your phone.
              </p>
              <Button 
                onClick={connectWhatsApp} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {loading ? "Connecting..." : "Connect WhatsApp"}
              </Button>
              
              {showQR && (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your WhatsApp mobile app
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Go to WhatsApp → Settings → Linked Devices → Link a Device
                  </p>
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
              {session.lastConnectedAt && (
                <p className="text-xs text-gray-500">
                  Last connected: {new Date(session.lastConnectedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
              <p>Connect your personal WhatsApp account using the QR code scanner on your phone</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <p>Configure your message templates and automation preferences</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <p>Messages will be sent automatically from your WhatsApp account at optimal times</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <p>Clients will see messages coming from your personal number, building trust</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
