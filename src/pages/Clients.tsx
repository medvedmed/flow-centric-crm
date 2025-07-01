
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Plus, Filter, UserPlus, TrendingUp, Star } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const Clients = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { hasPermissionSync } = usePermissions();

  const canCreateClients = hasPermissionSync('clients', 'create');

  // Fetch real client data
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', user?.id, searchTerm],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('clients')
        .select('*')
        .eq('salon_id', user.id);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ['client-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const thisMonth = new Date();
      const firstOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split('T')[0];

      // Total clients
      const { data: allClients } = await supabase
        .from('clients')
        .select('id, created_at, status, total_spent')
        .eq('salon_id', user.id);

      // New clients this month
      const newThisMonth = allClients?.filter(client => 
        client.created_at >= firstOfMonth
      ).length || 0;

      // VIP clients (clients with high spending)
      const vipClients = allClients?.filter(client => 
        Number(client.total_spent) >= 500
      ).length || 0;

      return {
        totalClients: allClients?.length || 0,
        newThisMonth,
        vipClients,
        retentionRate: '78%' // This would need more complex calculation
      };
    },
    enabled: !!user?.id,
  });

  const statsData = [
    { title: 'Total Clients', value: stats?.totalClients?.toString() || '0', icon: Users, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { title: 'New This Month', value: stats?.newThisMonth?.toString() || '0', icon: UserPlus, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { title: 'VIP Clients', value: stats?.vipClients?.toString() || '0', icon: Star, color: 'bg-gradient-to-r from-purple-500 to-violet-600' },
    { title: 'Retention Rate', value: stats?.retentionRate || '0%', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-600' },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-violet-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Client Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your salon's client relationships and history</p>
            </div>
            {canCreateClients && (
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search clients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50"
                />
              </div>
              <Button variant="outline" className="bg-white/50 border-violet-200">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Client Directory ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {clients.length > 0 ? clients.map((client) => (
                <div key={client.id} className="p-6 border-b border-violet-100 last:border-b-0 hover:bg-violet-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {client.name?.split(' ').map(n => n[0]).join('') || '??'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-gray-600 text-sm">{client.email}</p>
                        {client.phone && <p className="text-gray-500 text-sm">{client.phone}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{client.visits || 0}</p>
                        <p className="text-xs text-gray-500">Visits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${Number(client.total_spent || 0).toFixed(0)}</p>
                        <p className="text-xs text-gray-500">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status || 'New'}
                        </Badge>
                        {client.last_visit && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last: {format(new Date(client.last_visit), 'MMM d')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No clients found</h3>
                  <p>
                    {searchTerm 
                      ? 'Try adjusting your search criteria'
                      : 'Start by adding your first client'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Clients;
