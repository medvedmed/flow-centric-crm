
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Smartphone, Globe } from 'lucide-react';
import { WhatsAppIntegration } from './WhatsAppIntegration';
import { WhatsAppWebClient } from './WhatsAppWebClient';

export const WhatsAppSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">WhatsApp Integration</h2>
        <p className="text-muted-foreground">
          Connect your WhatsApp to send automated reminders and manage customer communications.
        </p>
      </div>

      <Tabs defaultValue="web-client" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="web-client" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            WhatsApp Web
          </TabsTrigger>
          <TabsTrigger value="business-api" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Business API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="web-client" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                WhatsApp Web Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">WhatsApp Web Features:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Connect using QR code scan</li>
                  <li>• Send messages directly from your browser</li>
                  <li>• Real-time message status updates</li>
                  <li>• No monthly fees or API costs</li>
                  <li>• Easy setup and management</li>
                </ul>
              </div>
              <WhatsAppWebClient />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                WhatsApp Business API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Business API Features:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Phone number verification</li>
                  <li>• Automated message scheduling</li>
                  <li>• Template message support</li>
                  <li>• Higher message limits</li>
                  <li>• Advanced automation features</li>
                </ul>
              </div>
              <WhatsAppIntegration />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
