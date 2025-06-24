
import React from 'react';
import { StaffPerformanceCard } from './performance/StaffPerformanceCard';
import { ClientDistributionCard } from './performance/ClientDistributionCard';
import { usePerformanceData } from './performance/usePerformanceData';
import { useClientCategorizationData } from './performance/useClientCategorizationData';

export const StaffPerformanceDashboard = () => {
  const { data: performanceData = [], isLoading } = usePerformanceData();
  const { data: clientCategorizationData = [] } = useClientCategorizationData();

  return (
    <div className="space-y-6">
      <StaffPerformanceCard 
        performanceData={performanceData} 
        isLoading={isLoading} 
      />
      <ClientDistributionCard 
        clientCategorizationData={clientCategorizationData} 
      />
    </div>
  );
};
