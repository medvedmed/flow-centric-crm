
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useClients, useDeleteClient } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddClientDialog } from '@/components/AddClientDialog';
import { ClientImportDialog } from '@/components/ClientImportDialog';
import { ModernClientCard } from '@/components/ModernClientCard';
import { usePermissions } from '@/hooks/usePermissions';
import { motion } from 'framer-motion';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Show more per page for card layout
  const { data: clientsData, isLoading, error } = useClients(searchTerm, page, pageSize, statusFilter);
  const { toast } = useToast();
  const { hasPermissionSync, userRole } = usePermissions();

  const clients = clientsData?.data || [];
  const totalCount = clientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const isStaff = userRole === 'staff';
  const canCreateClients = hasPermissionSync('clients', 'create');

  useEffect(() => {
    setPage(1); // Reset to first page when search term or status filter changes
  }, [searchTerm, statusFilter]);

  const handleViewHistory = (clientId: string) => {
    // TODO: Implement client history view
    toast({
      title: 'Client History',
      description: 'Client history feature will be implemented next.',
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const statusOptions = ['all', 'New', 'Active', 'Inactive'];

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
                  <p className="text-blue-100 text-sm font-medium">Active Clients</p>
                  <p className="text-3xl font-bold">{clients.filter(c => c.status === 'Active').length}</p>
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

        {/* Search and Filter */}
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
                    Showing {clients.length} of {totalCount} clients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Client Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
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
          ) : error ? (
            <Card className="border-0 bg-red-50 border border-red-200">
              <CardContent className="p-6 text-center">
                <p className="text-red-600">Error loading clients: {error.message}</p>
              </CardContent>
            </Card>
          ) : (
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
                    onViewHistory={handleViewHistory}
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
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                    className="bg-white/50 border-gray-200 hover:bg-teal-50 hover:border-teal-300"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    variant="outline"
                    className="bg-white/50 border-gray-200 hover:bg-teal-50 hover:border-teal-300"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Clients;
