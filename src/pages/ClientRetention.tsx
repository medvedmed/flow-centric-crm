
import React from 'react';
import { ClientRetentionDashboard } from '@/components/retention/ClientRetentionDashboard';

const ClientRetention = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Retention Dashboard</h1>
            <p className="text-gray-600 mt-1">Track client loyalty and staff retention performance</p>
          </div>
        </div>

        {/* Dashboard */}
        <ClientRetentionDashboard />
      </div>
    </div>
  );
};

export default ClientRetention;
