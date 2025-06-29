
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Plus, Filter, UserPlus, TrendingUp, Star } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { hasPermissionSync } = usePermissions();

  const canCreateClients = hasPermissionSync('clients', 'create');

  // Mock data for now
  const clients = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1234567890', status: 'Active', visits: 12, totalSpent: 850, lastVisit: '2024-01-15' },
    { id: 2, name: 'Mike Chen', email: 'mike@email.com', phone: '+1234567891', status: 'VIP', visits: 25, totalSpent: 1500, lastVisit: '2024-01-10' },
    { id: 3, name: 'Emma Wilson', email: 'emma@email.com', phone: '+1234567892', status: 'New', visits: 2, totalSpent: 120, lastVisit: '2024-01-12' },
  ];

  const stats = [
    { title: 'Total Clients', value: '1,248', icon: Users, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { title: 'New This Month', value: '47', icon: UserPlus, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { title: 'VIP Clients', value: '89', icon: Star, color: 'bg-gradient-to-r from-purple-500 to-violet-600' },
    { title: 'Retention Rate', value: '78%', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-600' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'New': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          {stats.map((stat, index) => (
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
              Client Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {clients.map((client) => (
                <div key={client.id} className="p-6 border-b border-violet-100 last:border-b-0 hover:bg-violet-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-gray-600 text-sm">{client.email}</p>
                        <p className="text-gray-500 text-sm">{client.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{client.visits}</p>
                        <p className="text-xs text-gray-500">Visits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${client.totalSpent}</p>
                        <p className="text-xs text-gray-500">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Last: {client.lastVisit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Clients;
