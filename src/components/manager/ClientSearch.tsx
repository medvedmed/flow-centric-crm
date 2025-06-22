
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClientSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ClientSearch = ({ searchTerm, onSearchChange }: ClientSearchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search clients by name, email, or ID..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};
