
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { History, Filter, Search, Calendar, User, Database, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: any;
  new_data: any;
  created_at: string;
  changed_by: string;
}

export const AuditTrailHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data: auditLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', searchTerm, tableFilter, actionFilter, dateFilter],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('salon_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (tableFilter) {
        query = query.eq('table_name', tableFilter);
      }

      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }

      if (dateFilter) {
        const startDate = new Date(dateFilter);
        const endDate = new Date(dateFilter);
        endDate.setDate(endDate.getDate() + 1);
        query = query.gte('created_at', startDate.toISOString())
                    .lt('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!user?.id,
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const displayNames: { [key: string]: string } = {
      'appointments': 'Appointments',
      'clients': 'Clients',
      'staff': 'Staff',
      'services': 'Services',
      'financial_transactions': 'Financial Transactions',
      'payment_methods': 'Payment Methods',
    };
    return displayNames[tableName] || tableName;
  };

  const renderChanges = (log: AuditLog) => {
    if (log.action === 'DELETE') {
      return (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-red-600">Record deleted</p>
          {log.old_data && (
            <pre className="mt-2 bg-red-50 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.old_data, null, 2)}
            </pre>
          )}
        </div>
      );
    }

    if (log.action === 'INSERT') {
      return (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-green-600">New record created</p>
          {log.new_data && (
            <pre className="mt-2 bg-green-50 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.new_data, null, 2)}
            </pre>
          )}
        </div>
      );
    }

    if (log.action === 'UPDATE' && log.old_data && log.new_data) {
      const changes: string[] = [];
      Object.keys(log.new_data).forEach(key => {
        if (log.old_data[key] !== log.new_data[key]) {
          changes.push(`${key}: ${log.old_data[key]} → ${log.new_data[key]}`);
        }
      });

      return (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-blue-600">Record updated</p>
          <ul className="mt-2 space-y-1">
            {changes.map((change, index) => (
              <li key={index} className="bg-blue-50 p-2 rounded text-xs">
                {change}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-violet-600" />
          Audit Trail & Change History
        </CardTitle>
        <p className="text-sm text-gray-600">
          Track all changes made to your salon data
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tables</SelectItem>
              <SelectItem value="appointments">Appointments</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="financial_transactions">Financial Transactions</SelectItem>
              <SelectItem value="payment_methods">Payment Methods</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="INSERT">Created</SelectItem>
              <SelectItem value="UPDATE">Updated</SelectItem>
              <SelectItem value="DELETE">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
              <span className="ml-2 text-gray-600">Loading audit logs...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No audit logs found matching your criteria</p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <Card key={log.id} className="bg-white/50 border-violet-100">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <Badge variant="outline">
                        {getTableDisplayName(log.table_name)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Record ID: {log.record_id}</span>
                    </div>
                  </div>

                  {renderChanges(log)}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
