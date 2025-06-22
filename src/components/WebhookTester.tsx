
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Webhook, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { webhookService } from '@/services/webhookService';
import { useToast } from '@/hooks/use-toast';

const WebhookTester = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testType, setTestType] = useState('client');
  const [customData, setCustomData] = useState('');
  const [lastResult, setLastResult] = useState<{ success: boolean; timestamp: string } | null>(null);

  const sampleData = {
    client: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      status: "VIP",
      assignedStaff: "Emma Wilson"
    },
    appointment: {
      clientName: "Jane Smith",
      service: "Haircut & Style",
      startTime: "14:00",
      endTime: "15:30",
      price: 85,
      status: "Scheduled"
    },
    staff: {
      name: "Emma Wilson",
      role: "Senior Stylist",
      email: "emma@salon.com",
      specialties: ["Hair Styling", "Coloring"]
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    
    try {
      let testData;
      
      if (customData.trim()) {
        try {
          testData = JSON.parse(customData);
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "Please check your custom data format",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        testData = sampleData[testType as keyof typeof sampleData];
      }

      const success = await webhookService.testWebhook({
        testType,
        ...testData
      });

      setLastResult({
        success,
        timestamp: new Date().toISOString()
      });

      toast({
        title: success ? "Webhook Test Successful" : "Webhook Test Failed",
        description: success 
          ? "Data sent to n8n webhook successfully" 
          : "Failed to send data to n8n webhook",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Test webhook error:', error);
      setLastResult({
        success: false,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          n8n Webhook Tester
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">https://medvedg.app.n8n.cloud/webhook-test/crm</Badge>
          {lastResult && (
            <Badge variant={lastResult.success ? "default" : "destructive"}>
              {lastResult.success ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              Last test: {lastResult.success ? 'Success' : 'Failed'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testType">Test Data Type</Label>
          <Select value={testType} onValueChange={setTestType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client Data</SelectItem>
              <SelectItem value="appointment">Appointment Data</SelectItem>
              <SelectItem value="staff">Staff Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sample Data Preview</Label>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <pre>{JSON.stringify(sampleData[testType as keyof typeof sampleData], null, 2)}</pre>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customData">Custom Data (Optional)</Label>
          <Textarea
            id="customData"
            placeholder="Enter custom JSON data to test with..."
            value={customData}
            onChange={(e) => setCustomData(e.target.value)}
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Leave empty to use sample data above
          </p>
        </div>

        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Test Webhook
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebhookTester;
