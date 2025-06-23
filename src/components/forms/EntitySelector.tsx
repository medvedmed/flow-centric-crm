
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EntityOption {
  id: string;
  name: string;
  description?: string;
  metadata?: any;
}

interface EntitySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  options: EntityOption[];
  placeholder?: string;
  isLoading?: boolean;
  showAddButton?: boolean;
  onAddNew?: () => void;
  renderOption?: (option: EntityOption) => React.ReactNode;
  emptyMessage?: string;
}

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  isLoading = false,
  showAddButton = false,
  onAddNew,
  renderOption,
  emptyMessage = "No options available"
}) => {
  const defaultRenderOption = (option: EntityOption) => (
    <div className="flex flex-col">
      <span>{option.name}</span>
      {option.description && (
        <span className="text-sm text-muted-foreground">{option.description}</span>
      )}
    </div>
  );

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : options.length === 0 ? (
            <SelectItem value="empty" disabled>{emptyMessage}</SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {renderOption ? renderOption(option) : defaultRenderOption(option)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {showAddButton && onAddNew && (
        <Button variant="outline" size="icon" onClick={onAddNew}>
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
