
import React, { useState } from 'react';
import { RetentionOverview } from './RetentionOverview';
import { StaffRetentionTable } from './StaffRetentionTable';
import { ClientRetentionChart } from './ClientRetentionChart';
import { RetentionFilters } from './RetentionFilters';

export const ClientRetentionDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const handleDateRangeChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-6">
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
