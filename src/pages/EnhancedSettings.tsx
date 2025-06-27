
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Palette, Bell, User } from 'lucide-react';
import { SecurityEnhancements } from '@/components/SecurityEnhancements';
import { LightFinanceUI } from '@/components/LightFinanceUI';
import NotificationPreferences from '@/components/NotificationPreferences';
import { SalonProfileSection } from '@/components/SalonProfileSection';

export default function EnhancedSettings() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your salon settings, security, and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <Palette className="w-4 h-4" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <SalonProfileSection />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityEnhancements />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <LightFinanceUI />
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-800">General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">General application settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
