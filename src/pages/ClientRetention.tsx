
import React from 'react';
import { ClientRetentionDashboard } from '@/components/retention/ClientRetentionDashboard';

const ClientRetention = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-violet-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Client Retention Dashboard
              </h1>
              <p className="text-gray-700 mt-2">Track client loyalty and staff retention performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <ClientRetentionDashboard />
      </div>
    </div>
  );
};

export default ClientRetention;
