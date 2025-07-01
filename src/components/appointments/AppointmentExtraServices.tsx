
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ExtraService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface AppointmentExtraServicesProps {
  services: Service[];
  extraServices: ExtraService[];
  onAddService: (serviceId: string) => void;
  onRemoveService: (serviceId: string) => void;
}

export const AppointmentExtraServices: React.FC<AppointmentExtraServicesProps> = ({
  services,
  extraServices,
  onAddService,
  onRemoveService
}) => {
  const totalExtraPrice = extraServices.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const totalExtraDuration = extraServices.reduce((sum, service) => sum + Number(service.duration || 0), 0);

  return (
    <div>
      <Label>Extra Services</Label>
      <div className="space-y-2">
        <Select onValueChange={onAddService}>
          <SelectTrigger>
            <SelectValue placeholder="Add extra service" />
          </SelectTrigger>
          <SelectContent>
            {services
              .filter(service => !extraServices.find(es => es.id === service.id))
              .map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - ${service.price} ({service.duration}min)
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        
        {extraServices.length > 0 && (
          <div className="space-y-2">
            {extraServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{service.name} - ${service.price} ({service.duration}min)</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveService(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="text-sm text-gray-600">
              Extra services total: ${totalExtraPrice} ({totalExtraDuration}min)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
