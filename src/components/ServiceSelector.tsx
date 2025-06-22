
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Service {
  name: string;
  price: number;
  duration: number;
  category: string;
}

const predefinedServices: Service[] = [
  // Hair Services
  { name: "Haircut & Style", price: 65, duration: 60, category: "Hair" },
  { name: "Hair Coloring", price: 120, duration: 120, category: "Hair" },
  { name: "Highlights", price: 150, duration: 150, category: "Hair" },
  { name: "Hair Wash & Blowdry", price: 35, duration: 45, category: "Hair" },
  { name: "Hair Treatment", price: 80, duration: 90, category: "Hair" },
  { name: "Beard Trim", price: 25, duration: 30, category: "Hair" },
  
  // Nails
  { name: "Manicure", price: 45, duration: 60, category: "Nails" },
  { name: "Pedicure", price: 55, duration: 75, category: "Nails" },
  { name: "Gel Manicure", price: 65, duration: 75, category: "Nails" },
  { name: "Nail Art", price: 85, duration: 90, category: "Nails" },
  
  // Beauty
  { name: "Facial", price: 90, duration: 75, category: "Beauty" },
  { name: "Eyebrow Shaping", price: 35, duration: 30, category: "Beauty" },
  { name: "Eyebrow Tinting", price: 25, duration: 20, category: "Beauty" },
  { name: "Eyelash Extensions", price: 120, duration: 120, category: "Beauty" },
  
  // Wellness
  { name: "Massage", price: 100, duration: 60, category: "Wellness" },
  { name: "Deep Tissue Massage", price: 120, duration: 75, category: "Wellness" },
];

interface ServiceSelectorProps {
  value: string;
  onValueChange: (service: string, price: number, duration: number) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  value,
  onValueChange
}) => {
  const handleServiceSelect = (serviceName: string) => {
    const service = predefinedServices.find(s => s.name === serviceName);
    if (service) {
      onValueChange(service.name, service.price, service.duration);
    }
  };

  // Group services by category
  const servicesByCategory = predefinedServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <Select value={value} onValueChange={handleServiceSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select a service" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(servicesByCategory).map(([category, services]) => (
          <div key={category}>
            <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 bg-gray-50">
              {category}
            </div>
            {services.map((service) => (
              <SelectItem key={service.name} value={service.name}>
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
  );
};
