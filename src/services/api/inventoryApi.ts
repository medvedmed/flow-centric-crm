
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  category: string;
  sku?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_price: number;
  supplier_name?: string;
  supplier_contact?: string;
  last_restocked_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryItem {
  name: string;
  description?: string;
  category: string;
  sku?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_price: number;
  supplier_name?: string;
  supplier_contact?: string;
}

export const inventoryApi = {
  async getItems(category?: string, lowStock?: boolean) {
    let query = supabase
      .from('inventory_items')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (lowStock) {
      // Use a subquery approach instead of raw SQL
      const { data: allItems, error: allError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true);
      
      if (allError) throw allError;
      
      const filteredItems = allItems?.filter(item => item.current_stock <= item.minimum_stock) || [];
      return filteredItems;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getItem(id: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createItem(item: CreateInventoryItem) {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{ ...item, salon_id: profile.user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateItem(id: string, updates: Partial<CreateInventoryItem>) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('inventory_items')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    const { data: item } = await this.getItem(id);
    if (!item) throw new Error('Item not found');

    let newStock = item.current_stock;
    switch (operation) {
      case 'add':
        newStock += quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, newStock - quantity);
        break;
      case 'set':
        newStock = quantity;
        break;
    }

    return this.updateItem(id, { 
      current_stock: newStock,
      last_restocked_at: operation === 'add' ? new Date().toISOString() : undefined
    });
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  },

  async getLowStockItems() {
    return this.getItems(undefined, true);
  }
};
