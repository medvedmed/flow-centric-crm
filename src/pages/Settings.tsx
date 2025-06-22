
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building, Shield, MessageSquare, Bell, Users } from "lucide-react";
import { useAdminSetup } from "@/hooks/useAdminSetup";
import { AdminSetupDialog } from "@/components/AdminSetupDialog";
import { SalonProfileSection } from "@/components/SalonProfileSection";
import { RoleManagementSection } from "@/components/RoleManagementSection";
import { RoleManagement } from "@/components/RoleManagement";
import { usePermissions } from "@/hooks/usePermissions";

const Settings = () => {
  const { needsAdminSetup } = useAdminSetup();
  const { hasPermissionSync } = usePermissions();
  const [showAdminDialog, setShowAdminDialog] = useState(needsAdminSetup);

  // Check if user has settings permissions
  const canViewSettings = hasPermissionSync('settings', 'view');
  const canEditSettings = hasPermissionSync('settings', 'edit');

  if (!canViewSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSetupDialog 
        open={showAdminDialog} 
        onClose={() => setShowAdminDialog(false)} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure your salon management system preferences and settings.</p>
        </div>
      </div>

      <Tabs defaultValue="salon" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="salon" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Salon
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salon" className="space-y-6">
          <SalonProfileSection />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {canEditSettings ? (
            <RoleManagementSection />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to manage users.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {canEditSettings ? (
            <RoleManagement />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to manage role permissions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">WhatsApp Integration</p>
                <p className="text-sm mb-4">
                  Connect your WhatsApp to send appointment reminders automatically.
                </p>
                <p className="text-xs text-blue-600">Coming Soon - DIKIDI-style integration</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Notification Settings</p>
                <p className="text-sm mb-4">
                  Configure how and when you receive notifications.
                </p>
                <p className="text-xs text-blue-600">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
