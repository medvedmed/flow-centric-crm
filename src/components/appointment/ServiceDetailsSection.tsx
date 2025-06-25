
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

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

interface ServiceDetailsSectionProps {
  selectedService: string;
  selectedStaff: string;
  basePrice: number;
  baseDuration: number;
  extraServices: ExtraService[];
  services: Service[];
  staff: any[];
  finalTotalPrice: number;
  finalTotalDuration: number;
  onServiceSelect: (serviceName: string) => void;
  onStaffSelect: (staffId: string) => void;
  onBasePriceChange: (price: number) => void;
  onBaseDurationChange: (duration: number) => void;
  onAddExtraService: (serviceId: string) => void;
  onRemoveExtraService: (serviceId: string) => void;
}

export const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({
  selectedService,
  selectedStaff,
  basePrice,
  baseDuration,
  extraServices,
  services,
  staff,
  finalTotalPrice,
  finalTotalDuration,
  onServiceSelect,
  onStaffSelect,
  onBasePriceChange,
  onBaseDurationChange,
  onAddExtraService,
  onRemoveExtraService
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Service Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service">Service</Label>
          <Select value={selectedService} onValueChange={onServiceSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name} - ${service.price} ({service.duration}min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="staff">Staff</Label>
          <Select value={selectedStaff} onValueChange={onStaffSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Extra Services */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Extra Services</Label>
          <Select onValueChange={onAddExtraService}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add extra service" />
            </SelectTrigger>
            <SelectContent>
              {services
                .filter(s => !extraServices.find(es => es.id === s.id))
                .map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <Plus className="w-3 h-3 mr-1" />
                    {service.name} - ${service.price}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        
        {extraServices.length > 0 && (
          <div className="space-y-2">
            {extraServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{service.name}</Badge>
                  <span className="text-sm text-gray-600">${service.price} • {service.duration}min</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveExtraService(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice">Base Price</Label>
          <Input
            id="basePrice"
            type="number"
            value={basePrice}
            onChange={(e) => onBasePriceChange(Number(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="baseDuration">Base Duration (minutes)</Label>
          <Input
            id="baseDuration"
            type="number"
            value={baseDuration}
            onChange={(e) => onBaseDurationChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Totals */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Price:</span>
          <span className="text-lg font-bold">${finalTotalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="font-semibold">Total Duration:</span>
          <span className="text-lg font-bold">{finalTotalDuration} minutes</span>
        </div>
      </div>
    </div>
  );
};
