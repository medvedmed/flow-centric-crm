
import React from 'react';
import { ClientRetentionDashboard } from '@/components/retention/ClientRetentionDashboard';

const ClientRetention = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Client Retention Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track client loyalty and staff retention performance</p>
          </div>
        </div>

        {/* Dashboard */}
        <ClientRetentionDashboard />
      </div>
    </div>
  );
};

export default ClientRetention;
