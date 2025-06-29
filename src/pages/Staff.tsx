
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCog, Search, Plus, Filter, Users, TrendingUp, Star, Calendar } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermissionSync } = usePermissions();

  const canCreateStaff = hasPermissionSync('staff', 'create');

  // Mock data for now
  const staff = [
    { id: 1, name: 'Alice Johnson', role: 'Senior Stylist', email: 'alice@salon.com', phone: '+1234567890', status: 'Active', rating: 4.8, appointments: 45, commission: '45%' },
    { id: 2, name: 'Bob Smith', role: 'Hair Colorist', email: 'bob@salon.com', phone: '+1234567891', status: 'Active', rating: 4.9, appointments: 38, commission: '40%' },
    { id: 3, name: 'Carol Davis', role: 'Nail Technician', email: 'carol@salon.com', phone: '+1234567892', status: 'Part-time', rating: 4.7, appointments: 22, commission: '35%' },
  ];

  const stats = [
    { title: 'Total Staff', value: '12', icon: Users, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { title: 'Active Today', value: '8', icon: Calendar, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { title: 'Top Performers', value: '3', icon: Star, color: 'bg-gradient-to-r from-purple-500 to-violet-600' },
    { title: 'Avg Rating', value: '4.8', icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-600' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Part-time': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Senior Stylist': return 'bg-purple-100 text-purple-800';
      case 'Hair Colorist': return 'bg-pink-100 text-pink-800';
      case 'Nail Technician': return 'bg-indigo-100 text-indigo-800';
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
                Staff Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your salon's team and performance</p>
            </div>
            {canCreateStaff && (
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
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
                  placeholder="Search staff by name, role, or email..."
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

        {/* Staff List */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-violet-600" />
              Team Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {staff.map((member) => (
                <div key={member.id} className="p-6 border-b border-violet-100 last:border-b-0 hover:bg-violet-50/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <Badge className={getRoleColor(member.role)} variant="secondary">
                          {member.role}
                        </Badge>
                        <p className="text-gray-600 text-sm mt-1">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-gray-900">{member.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{member.appointments}</p>
                        <p className="text-xs text-gray-500">This Month</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{member.commission}</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                      <div>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
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

export default Staff;
