
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface ClientInfoSectionProps {
  clientName: string;
  clientPhone: string;
  onClientNameChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
}

export const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  clientName,
  clientPhone,
  onClientNameChange,
  onClientPhoneChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <h3 className="font-semibold">Client Information</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientPhone">Client Phone</Label>
          <Input
            id="clientPhone"
            value={clientPhone}
            onChange={(e) => onClientPhoneChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
