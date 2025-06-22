
import { useState, useEffect } from 'react';
import { useClients } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { motion } from 'framer-motion';
import { AddClientDialog } from '@/components/AddClientDialog';
import { ClientImportDialog } from '@/components/ClientImportDialog';
import { ClientStatsCards } from '@/components/ClientStatsCards';
import { ClientSearchFilters } from '@/components/ClientSearchFilters';
import { ClientGrid } from '@/components/ClientGrid';
import { ClientPagination } from '@/components/ClientPagination';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const { data: clientsData, isLoading, error } = useClients(searchTerm, page, pageSize, statusFilter);
  const { toast } = useToast();
  const { userRole } = usePermissions();

  const clients = clientsData?.data || [];
  const totalCount = clientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const isStaff = userRole === 'staff';

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleViewHistory = (clientId: string) => {
    toast({
      title: 'Client History',
      description: 'Client history feature will be implemented next.',
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="space-y-8 p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {isStaff ? 'Client Directory' : 'Client Management'}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {isStaff 
                ? 'Browse client information and history' 
                : 'Manage your salon clients and their information'
              }
            </p>
          </div>

          {/* Action Buttons - Only for non-staff */}
          {!isStaff && (
            <div className="flex gap-3">
              <ClientImportDialog />
              <AddClientDialog />
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <ClientStatsCards clients={clients} totalCount={totalCount} />

        {/* Search and Filter */}
        <ClientSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clientsCount={clients.length}
          totalCount={totalCount}
        />

        {/* Client Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ClientGrid
            clients={clients}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onViewHistory={handleViewHistory}
          />
        </motion.div>

        {/* Pagination */}
        <ClientPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Clients;
