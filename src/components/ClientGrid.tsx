
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModernClientCard } from './ModernClientCard';
import { Client } from '@/services/types';

interface ClientGridProps {
  clients: Client[];
  isLoading: boolean;
  error: any;
  searchTerm: string;
  statusFilter: string;
  onViewHistory: (clientId: string) => void;
}

export const ClientGrid: React.FC<ClientGridProps> = ({
  clients,
  isLoading,
  error,
  searchTerm,
  statusFilter,
  onViewHistory
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="border-0 bg-white/80 backdrop-blur-xl shadow-xl animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 bg-red-50 border border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading clients: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {clients.map((client, index) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ModernClientCard
            client={client}
            onViewHistory={onViewHistory}
          />
        </motion.div>
      ))}
      {clients.length === 0 && (
        <div className="col-span-full">
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl border border-white/20">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first client'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
