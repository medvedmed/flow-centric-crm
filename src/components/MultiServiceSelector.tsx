
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface Service {
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface SelectedService extends Service {
  id: string;
  staffId?: string;
}

const predefinedServices: Service[] = [
  { name: "Haircut & Style", price: 65, duration: 60, category: "Hair" },
  { name: "Hair Coloring", price: 120, duration: 120, category: "Hair" },
  { name: "Highlights", price: 150, duration: 150, category: "Hair" },
  { name: "Hair Wash & Blowdry", price: 35, duration: 45, category: "Hair" },
  { name: "Hair Treatment", price: 80, duration: 90, category: "Hair" },
  { name: "Beard Trim", price: 25, duration: 30, category: "Hair" },
  { name: "Manicure", price: 45, duration: 60, category: "Nails" },
  { name: "Pedicure", price: 55, duration: 75, category: "Nails" },
  { name: "Gel Manicure", price: 65, duration: 75, category: "Nails" },
  { name: "Nail Art", price: 85, duration: 90, category: "Nails" },
  { name: "Facial", price: 90, duration: 75, category: "Beauty" },
  { name: "Eyebrow Shaping", price: 35, duration: 30, category: "Beauty" },
  { name: "Eyebrow Tinting", price: 25, duration: 20, category: "Beauty" },
  { name: "Eyelash Extensions", price: 120, duration: 120, category: "Beauty" },
  { name: "Massage", price: 100, duration: 60, category: "Wellness" },
  { name: "Deep Tissue Massage", price: 120, duration: 75, category: "Wellness" },
];

interface MultiServiceSelectorProps {
  selectedServices: SelectedService[];
  onServicesChange: (services: SelectedService[]) => void;
  availableStaff?: Array<{ id: string; name: string; specialties?: string[] }>;
}

export const MultiServiceSelector: React.FC<MultiServiceSelectorProps> = ({
  selectedServices,
  onServicesChange,
  availableStaff = []
}) => {
  const [currentService, setCurrentService] = useState<string>('');

  const addService = (serviceName: string) => {
    const service = predefinedServices.find(s => s.name === serviceName);
    if (service) {
      const newService: SelectedService = {
        ...service,
        id: `${Date.now()}-${Math.random()}`,
      };
      onServicesChange([...selectedServices, newService]);
      setCurrentService('');
    }
  };

  const removeService = (serviceId: string) => {
    onServicesChange(selectedServices.filter(s => s.id !== serviceId));
  };

  const updateServiceStaff = (serviceId: string, staffId: string) => {
    onServicesChange(
      selectedServices.map(service =>
        service.id === serviceId ? { ...service, staffId } : service
      )
    );
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  // Group services by category for better display
  const servicesByCategory = predefinedServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-4">
      {/* Service Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Add Services</label>
        <div className="flex gap-2">
          <Select value={currentService} onValueChange={setCurrentService}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a service to add" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(servicesByCategory).map(([category, services]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 bg-gray-50">
                    {category}
                  </div>
                  {services.map((service) => (
                    <SelectItem 
                      key={service.name} 
                      value={service.name}
                      disabled={selectedServices.some(s => s.name === service.name)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <div className="ml-4 text-sm text-gray-500">
                          ${service.price} • {service.duration}min
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            onClick={() => currentService && addService(currentService)}
            disabled={!currentService}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Selected Services</label>
          {selectedServices.map((service) => (
            <Card key={service.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    <Badge variant="secondary">{service.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    ${service.price} • {service.duration} minutes
                  </div>
                </div>
                
                {availableStaff.length > 0 && (
                  <div className="mx-4 min-w-[150px]">
                    <Select 
                      value={service.staffId || ''} 
                      onValueChange={(staffId) => updateServiceStaff(service.id, staffId)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Assign staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(service.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          
          {/* Summary */}
          <Card className="p-3 bg-purple-50 border-purple-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <div className="text-right">
                <div className="font-semibold">${totalPrice}</div>
                <div className="text-sm text-gray-600">{totalDuration} minutes</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
