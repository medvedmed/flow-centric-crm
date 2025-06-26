
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Server, Cloud } from 'lucide-react';

interface WhatsAppConfigToggleProps {
  onModeChange: (useServer: boolean) => void;
}

export const WhatsAppConfigToggle: React.FC<WhatsAppConfigToggleProps> = ({ onModeChange }) => {
  const [useServer, setUseServer] = useState(true); // Default to your server

  const handleToggle = (checked: boolean) => {
    setUseServer(checked);
    onModeChange(checked);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          WhatsApp Integration Mode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="h-5 w-5 text-blue-500" />
            <Label htmlFor="whatsapp-mode">Supabase Functions</Label>
          </div>
          
          <Switch
            id="whatsapp-mode"
            checked={useServer}
            onCheckedChange={handleToggle}
          />
          
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-green-500" />
            <Label htmlFor="whatsapp-mode">Local Server (Recommended)</Label>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            {useServer ? (
              <Badge variant="outline" className="bg-green-100 text-green-700">
                <Server className="w-3 h-3 mr-1" />
                Server Mode Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                <Cloud className="w-3 h-3 mr-1" />
                Supabase Mode Active
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600">
            {useServer ? (
              <>
                <strong>Server Mode:</strong> Uses your local WhatsApp Web.js server (localhost:3020) for real WhatsApp integration.
                Make sure your server is running before using this mode.
              </>
            ) : (
              <>
                <strong>Supabase Mode:</strong> Uses Supabase Edge Functions for WhatsApp integration.
                This is the fallback mode if your server is not available.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
