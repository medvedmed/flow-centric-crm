
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Smartphone, Globe, Zap, Settings, Clock } from 'lucide-react';
import { EnhancedWhatsAppWebClient } from './EnhancedWhatsAppWebClient';
import { WhatsAppWebClient } from './WhatsAppWebClient';
import { WhatsAppAutomation } from './WhatsAppAutomation';
import { WhatsAppConfigToggle } from './WhatsAppConfigToggle';

export const EnhancedWhatsAppSection: React.FC = () => {
  const [useServer, setUseServer] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Enhanced WhatsApp Integration</h2>
        <p className="text-muted-foreground">
          Connect your WhatsApp with enhanced features including automated reminders, message templates, and advanced scheduling.
        </p>
      </div>

      <WhatsAppConfigToggle onModeChange={setUseServer} />

      <Tabs defaultValue="enhanced-web" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhanced-web" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Enhanced WhatsApp Web
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced-web" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Enhanced WhatsApp Web Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Enhanced Features:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {useServer ? 'Real WhatsApp Web.js integration with your server' : 'Supabase Edge Function integration'}</li>
                  <li>• Enhanced QR code connection with better reliability</li>
                  <li>• Automated appointment reminder system</li>
                  <li>• Advanced message templates with variables</li>
                  <li>• Real-time delivery tracking and status updates</li>
                  <li>• Message queue processing for bulk operations</li>
                  <li>• Follow-up message automation</li>
                  <li>• Enhanced error handling and retry mechanisms</li>
                </ul>
              </div>
              
              {useServer ? <EnhancedWhatsAppWebClient /> : <WhatsAppWebClient />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                WhatsApp Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Automation Features:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Automatic appointment reminders (24h, 2h, 1h before)</li>
                  <li>• Customizable message templates with client/appointment data</li>
                  <li>• Follow-up messages for feedback collection</li>
                  <li>• Smart scheduling based on appointment times</li>
                  <li>• Bulk message processing with queue management</li>
                  <li>• Failed message retry with exponential backoff</li>
                  {useServer && <li>• Real-time queue processing every 30 seconds</li>}
                </ul>
              </div>
              <WhatsAppAutomation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">Rate Limiting & Security:</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Daily message limits to prevent spam detection</li>
                    <li>• Automatic rate limiting based on WhatsApp policies</li>
                    <li>• Session persistence and automatic reconnection</li>
                    <li>• Secure message queue with encryption</li>
                    {useServer && <li>• Local server with enhanced security controls</li>}
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-2">Integration Benefits:</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Seamless integration with existing appointment system</li>
                    <li>• Real-time sync with client database</li>
                    <li>• Automated client preference management</li>
                    <li>• Comprehensive message analytics and reporting</li>
                    {useServer && <li>• Direct WhatsApp Web.js API access for advanced features</li>}
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">Setup Instructions:</h3>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    {useServer ? (
                      <>
                        <li>Make sure your WhatsApp server is running on localhost:3020</li>
                        <li>Click "Connect Enhanced" to initialize WhatsApp Web</li>
                        <li>Scan the QR code with your WhatsApp mobile app</li>
                        <li>Configure automation settings in the Automation tab</li>
                        <li>Set up message templates with your preferred content</li>
                        <li>Enable desired reminder types and timing</li>
                        <li>Test the system by sending a test message</li>
                      </>
                    ) : (
                      <>
                        <li>Click "Connect Enhanced" to initialize WhatsApp Web</li>
                        <li>Scan the enhanced QR code with your WhatsApp mobile app</li>
                        <li>Configure automation settings in the Automation tab</li>
                        <li>Set up message templates with your preferred content</li>
                        <li>Enable desired reminder types and timing</li>
                        <li>Test the system by sending a test message</li>
                      </>
                    )}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
