
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, Search, Plus, Filter, Users, TrendingUp, Star, Calendar, Loader2, Download, Key, RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useStaff } from '@/hooks/staff/useStaffHooks';
import { useStaffCredentials } from '@/hooks/staff/useStaffCredentials';
import { useToast } from '@/hooks/use-toast';
import AddStaffDialog from '@/components/AddStaffDialog';
import { StaffCredentialsCard } from '@/components/StaffCredentialsCard';

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directory');
  const { hasPermissionSync } = usePermissions();
  const { toast } = useToast();
  const { generateMissingCredentials } = useStaffCredentials();

  const canCreateStaff = hasPermissionSync('staff_management', 'create');

  // Get real staff data from database
  const { data: staff = [], isLoading, error, refetch } = useStaff();

  // Calculate real stats from data
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const avgRating = staff.length > 0 ? 
    (staff.reduce((sum, s) => sum + (s.rating || 0), 0) / staff.length).toFixed(1) : '0.0';
  const topPerformers = staff.filter(s => (s.rating || 0) >= 4.5).length;
  const staffWithoutCredentials = staff.filter(s => !s.staffLoginId || !s.staffLoginPassword).length;

  const stats = [
    { title: 'Total Staff', value: totalStaff.toString(), icon: Users, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { title: 'Active Staff', value: activeStaff.toString(), icon: Calendar, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { title: 'Top Performers', value: topPerformers.toString(), icon: Star, color: 'bg-gradient-to-r from-purple-500 to-violet-600' },
    { title: 'Avg Rating', value: avgRating, icon: TrendingUp, color: 'bg-gradient-to-r from-orange-500 to-red-600' },
  ];

  // Filter staff based on search
  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load staff data. Please try again.",
      variant: "destructive",
    });
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateCredentials = async () => {
    try {
      await generateMissingCredentials.mutateAsync();
      await refetch(); // Refresh the staff data
    } catch (error) {
      console.error('Failed to generate credentials:', error);
    }
  };

  const handleExport = async () => {
    try {
      if (staff.length === 0) {
        toast({
          title: "No Data",
          description: "No staff members to export.",
          variant: "destructive",
        });
        return;
      }

      const headers = 'Name,Email,Phone,Status,Rating,Commission Rate,Hourly Rate,Specialties,Staff ID,Staff Password';
      const rows = staff.map(member => 
        `"${member.name}","${member.email || ''}","${member.phone || ''}","${member.status || 'inactive'}",${member.rating || 0},${member.commissionRate || 0},${member.hourlyRate || 0},"${member.specialties?.join('; ') || ''}","${member.staffLoginId || 'Not Generated'}","${member.staffLoginPassword || 'Not Generated'}"`
      ).join('\n');
      
      const csv = headers + '\n' + rows;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Staff list with credentials exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export staff list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'hair styling': return 'bg-purple-100 text-purple-800';
      case 'hair coloring': return 'bg-pink-100 text-pink-800';
      case 'nail care': return 'bg-indigo-100 text-indigo-800';
      case 'makeup': return 'bg-orange-100 text-orange-800';
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
              <p className="text-gray-600 mt-2">Manage your salon's team and their portal access</p>
              {staffWithoutCredentials > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    ⚠️ {staffWithoutCredentials} staff member(s) need login credentials
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {canCreateStaff && (
                <div className="[&>*]:!bg-gradient-to-r [&>*]:!from-violet-500 [&>*]:!to-purple-600 [&>*]:!hover:from-violet-600 [&>*]:!hover:to-purple-700">
                  <AddStaffDialog />
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleExport}
                className="bg-white/70 border-violet-200 hover:bg-violet-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Staff
              </Button>
            </div>
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

        {/* Main Content with Tabs */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="directory" className="flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  Staff Directory
                </TabsTrigger>
                <TabsTrigger value="credentials" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Login Credentials
                  {staffWithoutCredentials > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {staffWithoutCredentials}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="directory">
                {/* Search and Filters */}
                <div className="p-6 border-b">
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
                </div>

                {/* Staff List */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                    <span className="ml-2 text-gray-600">Loading staff...</span>
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <UserCog className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No staff members found</p>
                    <p className="text-sm">
                      {staff.length === 0 
                        ? "Add your first staff member to get started"
                        : "Try adjusting your search criteria"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredStaff.map((member) => (
                      <div key={member.id} className="p-6 border-b border-violet-100 last:border-b-0 hover:bg-violet-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                {!member.staffLoginId && (
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                                    No Login
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {member.specialties?.slice(0, 2).map((specialty, idx) => (
                                  <Badge key={idx} className={getSpecialtyColor(specialty)} variant="secondary">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{member.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-bold text-gray-900">{member.rating || 'N/A'}</span>
                              </div>
                              <p className="text-xs text-gray-500">Rating</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{member.commissionRate || 0}%</p>
                              <p className="text-xs text-gray-500">Commission</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-blue-600">${member.hourlyRate || 0}/hr</p>
                              <p className="text-xs text-gray-500">Hourly Rate</p>
                            </div>
                            <div>
                              <Badge className={getStatusColor(member.status || 'inactive')}>
                                {member.status || 'inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="credentials">
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Login Credentials</h3>
                      <p className="text-gray-600 text-sm">
                        Each staff member has unique login credentials to access their staff portal. 
                        Share these credentials securely with your team members.
                      </p>
                    </div>
                    {staffWithoutCredentials > 0 && (
                      <Button
                        onClick={handleGenerateCredentials}
                        disabled={generateMissingCredentials.isPending}
                        className="bg-gradient-to-r from-violet-500 to-purple-600"
                      >
                        {generateMissingCredentials.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Generate Missing Credentials
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                      <span className="ml-2 text-gray-600">Loading credentials...</span>
                    </div>
                  ) : staff.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No staff members found</p>
                      <p className="text-sm">Add staff members to generate their login credentials</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {staff.map((member) => (
                        <div key={member.id} className="space-y-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.email}</p>
                            </div>
                          </div>
                          <StaffCredentialsCard staff={member} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Staff;
