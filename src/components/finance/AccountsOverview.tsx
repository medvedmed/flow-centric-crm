
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const AccountsOverview = () => {
  const { user } = useAuth();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['finance-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_accounts')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('account_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const getAccountIcon = (accountType: string, accountName: string) => {
    if (accountName.toLowerCase().includes('cash')) {
      return <Wallet className="w-5 h-5" />;
    } else if (accountName.toLowerCase().includes('qnb') || accountName.toLowerCase().includes('terminal')) {
      return <CreditCard className="w-5 h-5" />;
    } else if (accountName.toLowerCase().includes('link')) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <DollarSign className="w-5 h-5" />;
  };

  const getAccountColor = (accountName: string) => {
    if (accountName.toLowerCase().includes('cash')) {
      return 'text-green-400';
    } else if (accountName.toLowerCase().includes('qnb')) {
      return 'text-blue-400';
    } else if (accountName.toLowerCase().includes('link')) {
      return 'text-purple-400';
    }
    return 'text-gray-400';
  };

  const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.current_balance), 0) || 0;

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
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
          <Wallet className="w-5 h-5" />
          Accounts & Cash Registers
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Total Balance */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-2xl font-bold text-white">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-3">
          {accounts?.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`${getAccountColor(account.account_name)}`}>
                  {getAccountIcon(account.account_type, account.account_name)}
                </div>
                <div>
                  <div className="text-white font-medium">{account.account_name}</div>
                  <div className="text-gray-400 text-sm capitalize">
                    {account.account_type.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white font-bold">
                  ${Number(account.current_balance).toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-green-600/20 text-green-400 border-green-600/30"
                >
                  Active
                </Badge>
              </div>
            </div>
          ))}

          {accounts?.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No payment accounts found</div>
              <div className="text-gray-500 text-sm">
                Payment accounts will be created automatically when you add transactions
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Active Accounts</div>
              <div className="text-lg font-bold text-white">{accounts?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Avg. Balance</div>
              <div className="text-lg font-bold text-white">
                ${accounts?.length ? (totalBalance / accounts.length).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
