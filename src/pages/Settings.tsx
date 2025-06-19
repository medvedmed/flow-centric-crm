
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, Upload, Bell, Shield, Database, Mail, Palette } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: "Aura CRM Company",
    address: "123 Business Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    phone: "+1 (555) 123-4567",
    email: "contact@auracrm.com",
    website: "https://auracrm.com",
    logo: ""
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    username: "noreply@auracrm.com",
    password: "",
    useSSL: true,
    senderName: "Aura CRM"
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newLeads: true,
    dealUpdates: true,
    taskReminders: true,
    systemAlerts: true
  });

  const handleSaveCompanyInfo = () => {
    toast({
      title: "Success",
      description: "Company information updated successfully!",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Success",
      description: "Email settings updated successfully!",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Success",
      description: "Notification preferences updated successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure your CRM system preferences and settings.</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="companyCity">City</Label>
                  <Input
                    id="companyCity"
                    value={companyInfo.city}
                    onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyState">State</Label>
                  <Input
                    id="companyState"
                    value={companyInfo.state}
                    onChange={(e) => setCompanyInfo({...companyInfo, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyZip">ZIP Code</Label>
                  <Input
                    id="companyZip"
                    value={companyInfo.zipCode}
                    onChange={(e) => setCompanyInfo({...companyInfo, zipCode: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyLogo">Company Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input type="file" accept="image/*" />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveCompanyInfo}>
                <Save className="w-4 h-4 mr-2" />
                Save Company Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emailUsername">Username</Label>
                  <Input
                    id="emailUsername"
                    value={emailSettings.username}
                    onChange={(e) => setEmailSettings({...emailSettings, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emailPassword">Password</Label>
                  <Input
                    id="emailPassword"
                    type="password"
                    value={emailSettings.password}
                    onChange={(e) => setEmailSettings({...emailSettings, password: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  value={emailSettings.senderName}
                  onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="useSSL"
                  checked={emailSettings.useSSL}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, useSSL: checked})}
                />
                <Label htmlFor="useSSL">Use SSL/TLS Encryption</Label>
              </div>

              <Button onClick={handleSaveEmailSettings}>
                <Save className="w-4 h-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Activity Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="newLeads"
                      checked={notifications.newLeads}
                      onCheckedChange={(checked) => setNotifications({...notifications, newLeads: checked})}
                    />
                    <Label htmlFor="newLeads">New Leads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dealUpdates"
                      checked={notifications.dealUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, dealUpdates: checked})}
                    />
                    <Label htmlFor="dealUpdates">Deal Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="taskReminders"
                      checked={notifications.taskReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, taskReminders: checked})}
                    />
                    <Label htmlFor="taskReminders">Task Reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="systemAlerts"
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemAlerts: checked})}
                    />
                    <Label htmlFor="systemAlerts">System Alerts</Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                    <Select defaultValue="8">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry</Label>
                    <Select defaultValue="90">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="twoFactor" />
                  <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <Select defaultValue="60">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Export</h3>
                <p className="text-sm text-muted-foreground">Export your CRM data for backup or migration purposes.</p>
                <div className="flex gap-2">
                  <Button variant="outline">Export Contacts</Button>
                  <Button variant="outline">Export Leads</Button>
                  <Button variant="outline">Export Deals</Button>
                  <Button variant="outline">Export All Data</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Import</h3>
                <p className="text-sm text-muted-foreground">Import data from CSV files or other CRM systems.</p>
                <div className="flex gap-2">
                  <Button variant="outline">Import Contacts</Button>
                  <Button variant="outline">Import Leads</Button>
                  <Button variant="outline">Import Companies</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-red-600">Data Cleanup</h3>
                <p className="text-sm text-muted-foreground">Clean up duplicate or outdated data.</p>
                <div className="flex gap-2">
                  <Button variant="outline">Find Duplicates</Button>
                  <Button variant="outline">Clean Inactive Records</Button>
                  <Button variant="destructive">Delete All Test Data</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <Select defaultValue="light">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Color Scheme</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                    <div className="w-full h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded mb-2"></div>
                    <p className="text-sm text-center">Blue & Purple</p>
                  </div>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-green-500">
                    <div className="w-full h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded mb-2"></div>
                    <p className="text-sm text-center">Green & Teal</p>
                  </div>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-orange-500">
                    <div className="w-full h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded mb-2"></div>
                    <p className="text-sm text-center">Orange & Red</p>
                  </div>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-gray-500">
                    <div className="w-full h-8 bg-gradient-to-r from-gray-600 to-slate-600 rounded mb-2"></div>
                    <p className="text-sm text-center">Gray & Slate</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="compactMode" />
                    <Label htmlFor="compactMode">Compact Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sidebarCollapsed" />
                    <Label htmlFor="sidebarCollapsed">Start with Sidebar Collapsed</Label>
                  </div>
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
