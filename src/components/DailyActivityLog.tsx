
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, User, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface DailyActivityLogProps {
  selectedDate: Date;
}

export const DailyActivityLog: React.FC<DailyActivityLogProps> = ({ selectedDate }) => {
  const { user } = useAuth();

  // Fetch real activity data for the selected date
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['daily-activities', user?.id, selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!user?.id) return [];

      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Get appointments for the day
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('date', dateStr)
        .order('updated_at', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Get financial transactions for the day
      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', user.id)
        .eq('transaction_date', dateStr)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Get audit logs for the day
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('salon_id', user.id)
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`)
        .order('created_at', { ascending: false });

      if (auditError) throw auditError;

      // Combine and format all activities
      const allActivities = [];

      // Add appointment activities
      appointments?.forEach(appointment => {
        allActivities.push({
          id: `apt-${appointment.id}`,
          type: 'appointment',
          action: 'created',
          title: `Appointment booked`,
          description: `${appointment.client_name} - ${appointment.service}`,
          time: appointment.created_at,
          status: appointment.status,
          amount: appointment.price,
          icon: Calendar,
          color: 'blue'
        });

        if (appointment.updated_at !== appointment.created_at) {
          allActivities.push({
            id: `apt-update-${appointment.id}`,
            type: 'appointment',
            action: 'updated',
            title: `Appointment updated`,
            description: `${appointment.client_name} - ${appointment.service}`,
            time: appointment.updated_at,
            status: appointment.status,
            amount: appointment.price,
            icon: Edit,
            color: 'orange'
          });
        }
      });

      // Add transaction activities
      transactions?.forEach(transaction => {
        allActivities.push({
          id: `txn-${transaction.id}`,
          type: 'transaction',
          action: transaction.transaction_type,
          title: `Payment ${transaction.transaction_type === 'income' ? 'received' : 'recorded'}`,
          description: transaction.description,
          time: transaction.created_at,
          amount: transaction.amount,
          paymentMethod: transaction.payment_method,
          icon: DollarSign,
          color: transaction.transaction_type === 'income' ? 'green' : 'red'
        });
      });

      // Add audit log activities
      auditLogs?.forEach(log => {
        allActivities.push({
          id: `audit-${log.id}`,
          type: 'audit',
          action: log.action,
          title: `${log.table_name} ${log.action}`,
          description: `Record ${log.action} in ${log.table_name}`,
          time: log.created_at,
          icon: Activity,
          color: 'purple'
        });
      });

      // Sort by time (most recent first)
      return allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (activity: any) => {
    const IconComponent = activity.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActivityColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusColors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-emerald-100 text-emerald-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'No Show': 'bg-orange-100 text-orange-800'
    };
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-600" />
            Daily Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-600" />
          Daily Activity Log
          <Badge variant="secondary" className="ml-auto">
            {activities.length} activities
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-violet-100">
                <div className={`p-2 rounded-full ${getActivityColor(activity.color)}`}>
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                    <div className="flex items-center gap-2 ml-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.time), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {activity.status && (
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    )}
                    {activity.amount && (
                      <Badge variant="secondary" className="text-xs">
                        ${Number(activity.amount).toFixed(2)}
                      </Badge>
                    )}
                    {activity.paymentMethod && (
                      <Badge variant="outline" className="text-xs">
                        {activity.paymentMethod}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activities recorded for {format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
