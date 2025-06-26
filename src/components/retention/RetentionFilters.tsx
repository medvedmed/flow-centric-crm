
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RetentionFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedStaff?: string;
  onStaffChange: (staffId?: string) => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate?: string, endDate?: string) => void;
}

export const RetentionFilters: React.FC<RetentionFiltersProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedStaff,
  onStaffChange,
  startDate,
  endDate,
  onDateRangeChange
}) => {
  const { user } = useAuth();

  const { data: staff } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name')
        .eq('salon_id', user?.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const handlePeriodChange = (period: string) => {
    onPeriodChange(period);
    
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    switch (period) {
      case 'week':
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'all':
      default:
        start = undefined;
        end = undefined;
        break;
    }

    onDateRangeChange(
      start?.toISOString().split('T')[0],
      end?.toISOString().split('T')[0]
    );
  };

  return (
    <Card className="bg-card border">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-40 bg-background border text-foreground">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-foreground">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Staff Filter */}
            <Select value={selectedStaff || 'all'} onValueChange={(value) => onStaffChange(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-48 bg-background border text-foreground">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all" className="text-foreground">All Staff</SelectItem>
                {staff?.map(member => (
                  <SelectItem key={member.id} value={member.id} className="text-foreground">
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(selectedStaff || selectedPeriod !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onStaffChange(undefined);
                  handlePeriodChange('all');
                }}
                className="border text-muted-foreground hover:bg-accent"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(startDate || endDate || selectedStaff) && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {startDate && endDate && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </div>
              )}
              {selectedStaff && (
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  {staff?.find(s => s.id === selectedStaff)?.name || 'Selected Staff'}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
