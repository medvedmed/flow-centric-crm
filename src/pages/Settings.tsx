
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building, Shield, MessageSquare, Bell, Users, Calendar, UserCog, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminSetup } from "@/hooks/useAdminSetup";
import { AdminSetupDialog } from "@/components/AdminSetupDialog";
import { SalonProfileSection } from "@/components/SalonProfileSection";
import { UnifiedRoleManagement } from "@/components/UnifiedRoleManagement";
import { WhatsAppSection } from "@/components/WhatsAppSection";
import { StaffScheduleSection } from "@/components/StaffScheduleSection";
import ManagerSection from "@/components/ManagerSection";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { needsAdminSetup } = useAdminSetup();
  const { hasPermissionSync, isLoading, error } = usePermissions();
  const { toast } = useToast();
  const [showAdminDialog, setShowAdminDialog] = useState(needsAdminSetup);

  // Show error if permissions failed to load
  useEffect(() => {
    if (error) {
      toast({
        title: "Permission Error",
        description: "Failed to load user permissions. Some features may not work correctly.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Check if user has settings permissions
  const canViewSettings = hasPermissionSync('settings', 'view');
  const canEditSettings = hasPermissionSync('settings', 'edit');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load settings. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="salon" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Salon</span>
          </TabsTrigger>
          <TabsTrigger value="manager" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">Manager</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salon" className="space-y-6">
          <SalonProfileSection />
        </TabsContent>

        <TabsContent value="manager" className="space-y-6">
          {canEditSettings ? (
            <ManagerSection />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to access the Manager section.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          {canEditSettings ? (
            <UnifiedRoleManagement />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to manage roles and permissions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          {canEditSettings ? (
            <StaffScheduleSection />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">You need edit permissions to manage staff schedules.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <WhatsAppSection />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
