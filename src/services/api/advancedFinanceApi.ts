
import { supabase } from '@/integrations/supabase/client';

export const advancedFinanceApi = {
  // Transactions
  async getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
    category?: string;
    paymentMethod?: string;
    clientName?: string;
    page?: number;
    pageSize?: number;
  }) {
    let query = supabase
      .from('finance_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    if (filters?.type) {
      query = query.eq('transaction_type', filters.type);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod);
    }
    if (filters?.clientName) {
      query = query.ilike('client_name', `%${filters.clientName}%`);
    }

    if (filters?.page && filters?.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: {
    transaction_type: 'income' | 'expense';
    client_name?: string;
    amount: number;
    payment_method: string;
    category: string;
    description?: string;
    transaction_date: string;
    is_tip?: boolean;
    staff_id?: string;
    invoice_id?: string;
  }) {
    // Get current user ID for salon_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        ...transaction,
        salon_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<{
    transaction_type: 'income' | 'expense';
    client_name: string;
    amount: number;
    payment_method: string;
    category: string;
    description: string;
    transaction_date: string;
    is_tip: boolean;
  }>) {
    const { data, error } = await supabase
      .from('finance_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Categories
  async getCategories(type?: 'income' | 'expense') {
    let query = supabase
      .from('finance_categories')
      .select('*')
      .order('category_name');

    if (type) {
      query = query.eq('category_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createCategory(category: {
    category_name: string;
    category_type: 'income' | 'expense';
    is_default?: boolean;
  }) {
    // Get current user ID for salon_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('finance_categories')
      .insert({
        ...category,
        salon_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Accounts
  async getAccounts() {
    const { data, error } = await supabase
      .from('finance_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_name');

    if (error) throw error;
    return data;
  },

  async createAccount(account: {
    account_name: string;
    account_type: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
    current_balance?: number;
  }) {
    // Get current user ID for salon_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('finance_accounts')
      .insert({
        ...account,
        salon_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAccountBalance(accountName: string, newBalance: number) {
    const { data, error } = await supabase
      .from('finance_accounts')
      .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('account_name', accountName)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Analytics
  async getAnalytics(period: 'day' | 'week' | 'month' | 'year', startDate?: string, endDate?: string) {
    let query = supabase
      .from('finance_analytics')
      .select('*')
      .eq('period_type', period)
      .order('period_start');

    if (startDate) {
      query = query.gte('period_start', startDate);
    }
    if (endDate) {
      query = query.lte('period_end', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Summary
  async getFinancialSummary(startDate?: string, endDate?: string) {
    let query = supabase
      .from('finance_transactions')
      .select('transaction_type, amount');

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const summary = data?.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.transaction_type === 'income') {
          acc.totalIncome += amount;
        } else {
          acc.totalExpenses += amount;
        }
        acc.transactionCount++;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }
    ) || { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };

    return {
      ...summary,
      netProfit: summary.totalIncome - summary.totalExpenses,
      profitMargin: summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0
    };
  }
};
