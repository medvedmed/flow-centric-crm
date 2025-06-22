
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Client } from '@/services/types';

interface ClientStatsCardsProps {
  clients: Client[];
  totalCount: number;
}

export const ClientStatsCards: React.FC<ClientStatsCardsProps> = ({ clients, totalCount }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <Card className="border-0 bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold">{totalCount}</p>
            </div>
            <Users className="w-8 h-8 text-teal-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Regular Clients</p>
              <p className="text-3xl font-bold">{clients.filter(c => c.status === 'Regular').length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">New This Month</p>
              <p className="text-3xl font-bold">{clients.filter(c => c.status === 'New').length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
