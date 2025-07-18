
import React, { useState } from 'react';
import { RetentionOverview } from './RetentionOverview';
import { StaffRetentionTable } from './StaffRetentionTable';
import { ClientRetentionChart } from './ClientRetentionChart';
import { RetentionFilters } from './RetentionFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ClientRetentionDashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const handleDateRangeChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const exportRetentionData = () => {
    const csvContent = `Date Range,${startDate || 'All Time'} - ${endDate || 'Present'}
Staff Filter,${selectedStaff || 'All Staff'}
Period,${selectedPeriod}

Generated on,${new Date().toLocaleString()}

Note: This is a sample export. Full implementation would include actual retention data.
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-retention-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Started",
      description: "Retention report has been downloaded",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-violet-800">
                <BarChart3 className="w-5 h-5" />
                Client Retention Analytics
              </CardTitle>
              <p className="text-violet-600 mt-1">Track client loyalty and staff performance metrics</p>
            </div>
            <Button onClick={exportRetentionData} variant="outline" className="border-violet-300 hover:bg-violet-50">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <RetentionFilters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedStaff={selectedStaff}
        onStaffChange={setSelectedStaff}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Overview Cards */}
      <RetentionOverview 
        startDate={startDate}
        endDate={endDate}
      />

      {/* Charts */}
      <ClientRetentionChart 
        startDate={startDate}
        endDate={endDate}
      />

      {/* Staff Retention Table */}
      <StaffRetentionTable 
        startDate={startDate}
        endDate={endDate}
        selectedStaffId={selectedStaff}
      />
    </div>
  );
};
