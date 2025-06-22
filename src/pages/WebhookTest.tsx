
import React from 'react';
import WebhookTester from '@/components/WebhookTester';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Webhook, Info } from 'lucide-react';

const WebhookTest = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">n8n Webhook Testing</h1>
        <p className="text-gray-600">Test your n8n webhook integration with CRM data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <WebhookTester />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline">1</Badge>
                <div>
                  <p className="font-medium">Select Data Type</p>
                  <p className="text-sm text-gray-600">Choose between client, appointment, or staff data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline">2</Badge>
                <div>
                  <p className="font-medium">Review Sample Data</p>
                  <p className="text-sm text-gray-600">Preview the data that will be sent to n8n</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline">3</Badge>
                <div>
                  <p className="font-medium">Send Test</p>
                  <p className="text-sm text-gray-600">Click the test button to send data to your n8n webhook</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Endpoint:</p>
                  <code className="text-xs bg-gray-100 p-1 rounded">
                    https://medvedg.app.n8n.cloud/webhook-test/crm
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium">Method:</p>
                  <Badge variant="outline">POST</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Content-Type:</p>
                  <code className="text-xs bg-gray-100 p-1 rounded">application/json</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WebhookTest;
