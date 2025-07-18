
import React from 'react';
import { ClientRetentionDashboard } from '@/components/retention/ClientRetentionDashboard';

const ClientRetention = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
