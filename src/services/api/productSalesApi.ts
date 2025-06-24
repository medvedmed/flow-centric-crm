
import { supabase } from '@/integrations/supabase/client';

export interface ProductSale {
  id: string;
  salon_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
  unit_selling_price: number;
  total_cost: number;
  total_revenue: number;
  profit: number;
  sale_date: string;
  payment_method: string;
  customer_name?: string;
  customer_phone?: string;
  transaction_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  inventory_items?: {
    id: string;
    name: string;
    category: string;
    sku?: string;
  };
}

export interface CreateProductSale {
  inventory_item_id: string;
  quantity: number;
  unit_selling_price: number;
  payment_method?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
}

export const productSalesApi = {
  async createSale(saleData: CreateProductSale) {
    console.log('Creating product sale:', saleData);
    
    // Get the inventory item details first
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('cost_price, selling_price, name')
      .eq('id', saleData.inventory_item_id)
      .single();

    if (itemError) throw itemError;

    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    const unitCost = item.cost_price || 0;
    const unitSellingPrice = saleData.unit_selling_price || item.selling_price || 0;
    const totalCost = unitCost * saleData.quantity;
    const totalRevenue = unitSellingPrice * saleData.quantity;
    const profit = totalRevenue - totalCost;

    // Create the product sale record
    const { data: sale, error: saleError } = await supabase
      .from('product_sales')
      .insert([{
        salon_id: profile.user.id,
        inventory_item_id: saleData.inventory_item_id,
        quantity: saleData.quantity,
        unit_cost: unitCost,
        unit_selling_price: unitSellingPrice,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        profit: profit,
        payment_method: saleData.payment_method || 'cash',
        customer_name: saleData.customer_name,
        customer_phone: saleData.customer_phone,
        notes: saleData.notes,
        created_by: profile.user.id
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Create financial transaction
    const { error: transactionError } = await supabase
      .from('financial_transactions')
      .insert([{
        salon_id: profile.user.id,
        transaction_type: 'income',
        category: 'Product Sales',
        amount: totalRevenue,
        description: `Sale of ${item.name} (${saleData.quantity}x)`,
        reference_id: sale.id,
        reference_type: 'product_sale',
        payment_method: saleData.payment_method || 'cash',
        product_sale_id: sale.id,
        created_by: profile.user.id
      }]);

    if (transactionError) throw transactionError;

    return sale;
  },

  async getSales(startDate?: string, endDate?: string, page = 1, pageSize = 50) {
    // First get the sales
    let query = supabase
      .from('product_sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('sale_date', startDate);
    }

    if (endDate) {
      query = query.lte('sale_date', endDate);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: sales, error } = await query.range(from, to);
    const { count } = await supabase
      .from('product_sales')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // Then get inventory items for each sale
    if (sales && sales.length > 0) {
      const inventoryIds = [...new Set(sales.map(sale => sale.inventory_item_id))];
      const { data: inventoryItems } = await supabase
        .from('inventory_items')
        .select('id, name, category, sku')
        .in('id', inventoryIds);

      // Map inventory items to sales
      const salesWithItems = sales.map(sale => ({
        ...sale,
        inventory_items: inventoryItems?.find(item => item.id === sale.inventory_item_id) || null
      }));

      return {
        data: salesWithItems,
        count: count || 0,
        hasMore: (count || 0) > to + 1,
        page,
        pageSize
      };
    }
    
    return {
      data: sales || [],
      count: count || 0,
      hasMore: (count || 0) > to + 1,
      page,
      pageSize
    };
  },

  async getTodaysSales(): Promise<ProductSale[]> {
    const today = new Date().toISOString().split('T')[0];
    
    // First get today's sales
    const { data: sales, error } = await supabase
      .from('product_sales')
      .select('*')
      .eq('sale_date', today)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (sales && sales.length > 0) {
      // Then get inventory items for each sale
      const inventoryIds = [...new Set(sales.map(sale => sale.inventory_item_id))];
      const { data: inventoryItems } = await supabase
        .from('inventory_items')
        .select('id, name, category')
        .in('id', inventoryIds);

      // Map inventory items to sales
      return sales.map(sale => ({
        ...sale,
        inventory_items: inventoryItems?.find(item => item.id === sale.inventory_item_id) || null
      })) as ProductSale[];
    }

    return sales || [];
  },

  async getSalesStats(startDate?: string, endDate?: string) {
    let query = supabase
      .from('product_sales')
      .select('total_revenue, profit, quantity');

    if (startDate) {
      query = query.gte('sale_date', startDate);
    }

    if (endDate) {
      query = query.lte('sale_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = data?.reduce((acc, sale) => ({
      totalRevenue: acc.totalRevenue + (sale.total_revenue || 0),
      totalProfit: acc.totalProfit + (sale.profit || 0),
      totalQuantity: acc.totalQuantity + (sale.quantity || 0),
      totalSales: acc.totalSales + 1
    }), {
      totalRevenue: 0,
      totalProfit: 0,
      totalQuantity: 0,
      totalSales: 0
    }) || {
      totalRevenue: 0,
      totalProfit: 0,
      totalQuantity: 0,
      totalSales: 0
    };

    return stats;
  }
};
