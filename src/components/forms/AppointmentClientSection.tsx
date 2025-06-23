
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Phone, CheckCircle } from 'lucide-react';
import { ClientSelector } from '../ClientSelector';

interface AppointmentClientSectionProps {
  clientId: string;
  clientName: string;
  clientPhone: string;
  onClientSelect: (clientId: string, clientName: string, clientPhone?: string) => void;
  onClientNameChange: (name: string) => void;
  onClientPhoneChange: (phone: string) => void;
}

export const AppointmentClientSection: React.FC<AppointmentClientSectionProps> = ({
  clientId,
  clientName,
  clientPhone,
  onClientSelect,
  onClientNameChange,
  onClientPhoneChange
}) => {
  return (
    <div className="space-y-4">
      {/* Client Selection */}
      <div className="space-y-2">
        <Label>Client *</Label>
        <ClientSelector
          value={clientId}
          onValueChange={onClientSelect}
        />
        {clientId && clientName && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <CheckCircle className="inline w-4 h-4 mr-1" />
              Selected client: <strong>{clientName}</strong>
            </p>
            {clientPhone && (
              <p className="text-sm text-green-700 mt-1">
                <Phone className="inline w-4 h-4 mr-1" />
                {clientPhone}
              </p>
            )}
            <p className="text-xs text-green-600 mt-1">
              Phone number is optional for existing clients
            </p>
          </div>
        )}
        {!clientId && clientName && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <User className="inline w-4 h-4 mr-1" />
              Walk-in client: <strong>{clientName}</strong>
            </p>
            {clientPhone && (
              <p className="text-sm text-blue-700 mt-1">
                <Phone className="inline w-4 h-4 mr-1" />
                {clientPhone}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Manual Client Info for Walk-ins */}
      {!clientId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="walkInName">Walk-in Client Name *</Label>
            <Input
              id="walkInName"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label htmlFor="walkInPhone">Phone Number (Optional)</Label>
            <Input
              id="walkInPhone"
              value={clientPhone}
              onChange={(e) => onClientPhoneChange(e.target.value)}
              placeholder="(555) 123-4567 or 555-123-4567"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepts formats: (555) 123-4567, 555-123-4567, 5551234567
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
