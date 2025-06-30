
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, Calendar, User, DollarSign, Edit, Trash2, 
  Plus, Search, Filter, Clock, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  table_name: string;
  action: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  changed_by: string;
  created_at: string;
  salon_id: string;
}

interface DailyActivityLogProps {
  selectedDate?: Date;
}

export const DailyActivityLog: React.FC<DailyActivityLogProps> = ({ 
  selectedDate = new Date() 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: activityLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['daily-activity-logs', dateString, user?.id],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          changed_by_profile:profiles!changed_by(full_name)
        `)
        .eq('salon_id', user?.id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.new_data || {}).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTable = filterTable === 'all' || log.table_name === filterTable;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesTable && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames: { [key: string]: string } = {
      'appointments': 'Appointments',
      'clients': 'Clients',
      'staff': 'Staff',
      'services': 'Services',
      'financial_transactions': 'Financial Transactions',
      'client_payments': 'Client Payments',
      'products': 'Products',
      'inventory_items': 'Inventory'
    };
    return tableNames[tableName] || tableName.replace('_', ' ').toUpperCase();
  };

  const formatChangeDescription = (log: ActivityLog) => {
    const tableName = getTableDisplayName(log.table_name);
    
    switch (log.action.toUpperCase()) {
      case 'INSERT':
        if (log.table_name === 'appointments' && log.new_data) {
          return `New appointment created for ${log.new_data.client_name} - ${log.new_data.service}`;
        }
        if (log.table_name === 'clients' && log.new_data) {
          return `New client added: ${log.new_data.name}`;
        }
        if (log.table_name === 'client_payments' && log.new_data) {
          return `Payment recorded: $${log.new_data.amount} (${log.new_data.payment_method})`;
        }
        return `New ${tableName.toLowerCase()} record created`;
      
      case 'UPDATE':
        if (log.table_name === 'appointments' && log.new_data) {
          const changes = [];
          if (log.old_data?.status !== log.new_data.status) {
            changes.push(`status changed to ${log.new_data.status}`);
          }
          if (log.old_data?.payment_status !== log.new_data.payment_status) {
            changes.push(`payment status changed to ${log.new_data.payment_status}`);
          }
          if (log.old_data?.price !== log.new_data.price) {
            changes.push(`price updated to $${log.new_data.price}`);
          }
          return `Appointment updated for ${log.new_data.client_name}${changes.length > 0 ? ': ' + changes.join(', ') : ''}`;
        }
        return `${tableName} record updated`;
      
      case 'DELETE':
        return `${tableName} record deleted`;
      
      default:
        return `${tableName} ${log.action}`;
    }
  };

  const uniqueTables = [...new Set(activityLogs.map(log => log.table_name))];
  const uniqueActions = [...new Set(activityLogs.map(log => log.action.toUpperCase()))];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Daily Activity Log
            <Badge variant="secondary" className="ml-2">
              {format(selectedDate, 'MMM d, yyyy')}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              {uniqueTables.map(table => (
                <SelectItem key={table} value={table}>
                  {getTableDisplayName(table)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionColor(log.action)}>
                      {log.action.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {getTableDisplayName(log.table_name)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.created_at), 'h:mm a')}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {formatChangeDescription(log)}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>
                      Changed by: {(log as any).changed_by_profile?.full_name || 'System'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activity found for this date</p>
              {(searchTerm || filterTable !== 'all' || filterAction !== 'all') && (
                <p className="text-sm">Try adjusting your filters</p>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredLogs.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total activities: {filteredLogs.length}</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <Plus className="w-3 h-3 text-green-600" />
                  {filteredLogs.filter(log => log.action.toUpperCase() === 'INSERT').length} Created
                </span>
                <span className="flex items-center gap-1">
                  <Edit className="w-3 h-3 text-blue-600" />
                  {filteredLogs.filter(log => log.action.toUpperCase() === 'UPDATE').length} Updated
                </span>
                <span className="flex items-center gap-1">
                  <Trash2 className="w-3 h-3 text-red-600" />
                  {filteredLogs.filter(log => log.action.toUpperCase() === 'DELETE').length} Deleted
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
