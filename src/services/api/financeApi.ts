
import { supabase } from '@/integrations/supabase/client';

export interface FinancialTransaction {
  id: string;
  salon_id: string;
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  payment_method: string;
  reference_id?: string;
  reference_type?: string;
  transaction_date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransaction {
  transaction_type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  payment_method?: string;
  reference_id?: string;
  reference_type?: string;
  transaction_date?: string;
}

export const financeApi = {
  async getTransactions(
    startDate?: string,
    endDate?: string,
    type?: 'income' | 'expense',
    category?: string,
    page: number = 1,
    pageSize: number = 50
  ) {
    console.log('financeApi.getTransactions called with:', { startDate, endDate, type, category, page });
    
    try {
      let query = supabase
        .from('financial_transactions')
        .select('*', { count: 'exact' })
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
      
      if (error) {
        console.error('Database error in getTransactions:', error);
        throw error;
      }

      console.log('Retrieved transactions:', data?.length || 0, 'of', count || 0);

      return {
        data: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page
      };
    } catch (error) {
      console.error('Error in financeApi.getTransactions:', error);
      throw error;
    }
  },

  async createTransaction(transaction: CreateTransaction) {
    console.log('financeApi.createTransaction called with:', transaction.category);
    
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{
          ...transaction,
          salon_id: profile.user.id,
          created_by: profile.user.id,
          payment_method: transaction.payment_method || 'cash',
          transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Database error in createTransaction:', error);
        throw error;
      }
      
      console.log('Created transaction:', data?.id);
      return data;
    } catch (error) {
      console.error('Error in financeApi.createTransaction:', error);
      throw error;
    }
  },

  async updateTransaction(id: string, updates: Partial<CreateTransaction>) {
    console.log('financeApi.updateTransaction called with id:', id);
    
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Database error in updateTransaction:', error);
        throw error;
      }
      
      console.log('Updated transaction:', data?.id);
      return data;
    } catch (error) {
      console.error('Error in financeApi.updateTransaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id: string) {
    console.log('financeApi.deleteTransaction called with id:', id);
    
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Database error in deleteTransaction:', error);
        throw error;
      }
      
      console.log('Deleted transaction:', id);
    } catch (error) {
      console.error('Error in financeApi.deleteTransaction:', error);
      throw error;
    }
  },

  async getFinancialSummary(startDate?: string, endDate?: string) {
    console.log('financeApi.getFinancialSummary called with:', { startDate, endDate });
    
    try {
      let query = supabase
        .from('financial_transactions')
        .select('transaction_type, amount, transaction_date');

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Database error in getFinancialSummary:', error);
        throw error;
      }

      const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        transactionCount: data?.length || 0
      };

      data?.forEach(transaction => {
        const amount = Number(transaction.amount);
        if (transaction.transaction_type === 'income') {
          summary.totalIncome += amount;
        } else {
          summary.totalExpenses += amount;
        }
      });

      summary.netProfit = summary.totalIncome - summary.totalExpenses;

      console.log('Financial summary calculated:', summary);
      return summary;
    } catch (error) {
      console.error('Error in financeApi.getFinancialSummary:', error);
      throw error;
    }
  },

  async getCategorySummary(type: 'income' | 'expense', startDate?: string, endDate?: string) {
    console.log('financeApi.getCategorySummary called with:', { type, startDate, endDate });
    
    try {
      let query = supabase
        .from('financial_transactions')
        .select('category, amount')
        .eq('transaction_type', type);

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Database error in getCategorySummary:', error);
        throw error;
      }

      const categoryTotals: Record<string, number> = {};
      
      data?.forEach(transaction => {
        const category = transaction.category;
        const amount = Number(transaction.amount);
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      const result = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }));

      console.log('Category summary calculated:', result.length, 'categories');
      return result;
    } catch (error) {
      console.error('Error in financeApi.getCategorySummary:', error);
      throw error;
    }
  }
};
