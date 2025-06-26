
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface AllOperationsListProps {
  onTransactionClick: (transaction: any) => void;
}

export const AllOperationsList: React.FC<AllOperationsListProps> = ({ onTransactionClick }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense' | 'cash' | 'cashless'>('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['finance-all-operations', searchTerm, activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('finance_transactions')
        .select('*')
        .eq('salon_id', user?.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (activeFilter === 'income') {
        query = query.eq('transaction_type', 'income');
      } else if (activeFilter === 'expense') {
        query = query.eq('transaction_type', 'expense');
      } else if (activeFilter === 'cash') {
        query = query.eq('payment_method', 'Cash');
      } else if (activeFilter === 'cashless') {
        query = query.neq('payment_method', 'Cash');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Apply search filter
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(transaction => 
          transaction.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredData;
    },
    enabled: !!user
  });

  const filters = [
    { key: 'all', label: 'All', count: transactions?.length || 0 },
    { key: 'income', label: 'Income', count: transactions?.filter(t => t.transaction_type === 'income').length || 0 },
    { key: 'expense', label: 'Expenses', count: transactions?.filter(t => t.transaction_type === 'expense').length || 0 },
    { key: 'cash', label: 'Cash payment', count: transactions?.filter(t => t.payment_method === 'Cash').length || 0 },
    { key: 'cashless', label: 'Cashless payment', count: transactions?.filter(t => t.payment_method !== 'Cash').length || 0 }
  ];

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'Cash': return 'Cash';
      case 'QNB Terminal': return 'QNB terminal';
      case 'LINK Payment': return 'LINK Payment';
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          All Operations
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by client or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key as any)}
              className={`${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-transparent border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              {filter.label}
              <Badge 
                variant="secondary" 
                className="ml-2 bg-gray-700 text-gray-300"
              >
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {transactions?.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => onTransactionClick(transaction)}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Transaction Type Icon */}
                <div className={`p-2 rounded-full ${
                  transaction.transaction_type === 'income' 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {transaction.transaction_type === 'income' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                {/* Transaction Details */}
                <div>
                  <div className="font-medium text-white">
                    {transaction.client_name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <span>{getPaymentMethodDisplay(transaction.payment_method)}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</span>
                  </div>
                  {transaction.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className={`text-lg font-bold ${
                transaction.transaction_type === 'income' 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {transaction.transaction_type === 'income' ? '+' : '-'}
                ${Number(transaction.amount).toFixed(2)}
              </div>
            </div>
          ))}

          {transactions?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No operations found</div>
              <div className="text-gray-500 text-sm">
                {searchTerm || activeFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first financial operation'
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
