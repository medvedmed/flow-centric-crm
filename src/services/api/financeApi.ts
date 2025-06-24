
import { supabase } from '@/integrations/supabase/client';

export interface FinancialTransaction {
  id: string;
  salon_id: string;
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  payment_method: string;
  transaction_date: string;
  reference_id?: string;
  reference_type?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransaction {
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  payment_method: string;
  transaction_date: string;
  reference_id?: string;
  reference_type?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
}

export interface TransactionsResponse {
  data: FinancialTransaction[];
  count: number;
}

export const financeApi = {
  async getTransactions(
    startDate?: string,
    endDate?: string,
    type?: 'income' | 'expense',
    category?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<TransactionsResponse> {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    let query = supabase
      .from('financial_transactions')
      .select('*', { count: 'exact' })
      .eq('salon_id', profile.user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }
    if (type) {
      query = query.eq('transaction_type', type);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'income' | 'expense'
      })),
      count: count || 0
    };
  },

  async createTransaction(transaction: CreateTransaction): Promise<FinancialTransaction> {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([{
        ...transaction,
        salon_id: profile.user.id,
        created_by: profile.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      transaction_type: data.transaction_type as 'income' | 'expense'
    };
  },

  async updateTransaction(id: string, updates: Partial<CreateTransaction>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      transaction_type: data.transaction_type as 'income' | 'expense'
    };
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFinancialSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    let query = supabase
      .from('financial_transactions')
      .select('transaction_type, amount')
      .eq('salon_id', profile.user.id);

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
        if (transaction.transaction_type === 'income') {
          acc.totalIncome += Number(transaction.amount);
        } else {
          acc.totalExpenses += Number(transaction.amount);
        }
        acc.transactionCount++;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }
    ) || { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };

    return {
      ...summary,
      netProfit: summary.totalIncome - summary.totalExpenses
    };
  },

  async getCategorySummary(
    type: 'income' | 'expense',
    startDate?: string,
    endDate?: string
  ): Promise<CategorySummary[]> {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    let query = supabase
      .from('financial_transactions')
      .select('category, amount')
      .eq('salon_id', profile.user.id)
      .eq('transaction_type', type);

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const categoryMap = new Map<string, number>();
    data?.forEach(transaction => {
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + Number(transaction.amount));
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
  }
};
