
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Calendar, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email: {
    enabled: boolean;
    appointments: boolean;
    reminders: boolean;
    cancellations: boolean;
    reports: boolean;
  };
  push: {
    enabled: boolean;
    appointments: boolean;
    reminders: boolean;
    cancellations: boolean;
  };
  sms: {
    enabled: boolean;
    appointments: boolean;
    reminders: boolean;
  };
  timing: {
    reminderHours: number;
    reportFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

export const NotificationPreferences: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      appointments: true,
      reminders: true,
      cancellations: true,
      reports: false,
    },
    push: {
      enabled: true,
      appointments: true,
      reminders: true,
      cancellations: true,
    },
    sms: {
      enabled: false,
      appointments: false,
      reminders: false,
    },
    timing: {
      reminderHours: 24,
      reportFrequency: 'weekly',
    }
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof NotificationSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications about your salon operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={settings.email.enabled}
                onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
              />
            </div>

            {settings.email.enabled && (
              <div className="ml-8 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-appointments">New appointments</Label>
                  <Switch
                    id="email-appointments"
                    checked={settings.email.appointments}
                    onCheckedChange={(checked) => updateSetting('email', 'appointments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reminders">Appointment reminders</Label>
                  <Switch
                    id="email-reminders"
                    checked={settings.email.reminders}
                    onCheckedChange={(checked) => updateSetting('email', 'reminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-cancellations">Cancellations</Label>
                  <Switch
                    id="email-cancellations"
                    checked={settings.email.cancellations}
                    onCheckedChange={(checked) => updateSetting('email', 'cancellations', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reports">Weekly reports</Label>
                  <Switch
                    id="email-reports"
                    checked={settings.email.reports}
                    onCheckedChange={(checked) => updateSetting('email', 'reports', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive instant notifications in your browser</p>
                </div>
              </div>
              <Switch
                checked={settings.push.enabled}
                onCheckedChange={(checked) => updateSetting('push', 'enabled', checked)}
              />
            </div>

            {settings.push.enabled && (
              <div className="ml-8 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-appointments">New appointments</Label>
                  <Switch
                    id="push-appointments"
                    checked={settings.push.appointments}
                    onCheckedChange={(checked) => updateSetting('push', 'appointments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-reminders">Appointment reminders</Label>
                  <Switch
                    id="push-reminders"
                    checked={settings.push.reminders}
                    onCheckedChange={(checked) => updateSetting('push', 'reminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-cancellations">Cancellations</Label>
                  <Switch
                    id="push-cancellations"
                    checked={settings.push.cancellations}
                    onCheckedChange={(checked) => updateSetting('push', 'cancellations', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Receive text messages on your phone</p>
                </div>
              </div>
              <Switch
                checked={settings.sms.enabled}
                onCheckedChange={(checked) => updateSetting('sms', 'enabled', checked)}
              />
            </div>

            {settings.sms.enabled && (
              <div className="ml-8 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-appointments">New appointments</Label>
                  <Switch
                    id="sms-appointments"
                    checked={settings.sms.appointments}
                    onCheckedChange={(checked) => updateSetting('sms', 'appointments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-reminders">Appointment reminders</Label>
                  <Switch
                    id="sms-reminders"
                    checked={settings.sms.reminders}
                    onCheckedChange={(checked) => updateSetting('sms', 'reminders', checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timing Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timing Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reminder-hours">Reminder Hours Before Appointment</Label>
                <Select
                  value={settings.timing.reminderHours.toString()}
                  onValueChange={(value) => updateSetting('timing', 'reminderHours', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="report-frequency">Report Frequency</Label>
                <Select
                  value={settings.timing.reportFrequency}
                  onValueChange={(value) => updateSetting('timing', 'reportFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-800">Email notifications</span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-sm font-medium text-yellow-800">Push notifications</span>
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Pending Permission</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-800">SMS notifications</span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">Disabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
