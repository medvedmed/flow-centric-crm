
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clientsCount: number;
  totalCount: number;
}

export const ClientSearchFilters: React.FC<ClientSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  clientsCount,
  totalCount
}) => {
  const statusOptions = ['all', 'New', 'Regular', 'VIP', 'Inactive'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Clients</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/50 border-gray-200 focus:border-teal-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">
                Showing {clientsCount} of {totalCount} clients
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
