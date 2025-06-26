
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
    console.log('inventoryApi.getItems called with:', { category, lowStock });
    
    try {
      let query = supabase
        .from('inventory_items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Database error in getItems:', error);
        throw error;
      }

      console.log('Retrieved items:', data?.length || 0);

      if (lowStock && data) {
        // Filter low stock items in JavaScript to avoid database type issues
        const lowStockItems = data.filter(item => {
          const currentStock = Number(item.current_stock);
          const minimumStock = Number(item.minimum_stock);
          return currentStock < minimumStock;
        });
        console.log('Low stock items found:', lowStockItems.length);
        return lowStockItems;
      }

      return data || [];
    } catch (error) {
      console.error('Error in inventoryApi.getItems:', error);
      throw error;
    }
  },

  async getItem(id: string) {
    console.log('inventoryApi.getItem called with id:', id);
    
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Database error in getItem:', error);
        throw error;
      }
      
      console.log('Retrieved item:', data?.id);
      return data;
    } catch (error) {
      console.error('Error in inventoryApi.getItem:', error);
      throw error;
    }
  },

  async createItem(item: CreateInventoryItem) {
    console.log('inventoryApi.createItem called with:', item.name);
    
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{ ...item, salon_id: profile.user.id }])
        .select()
        .single();
      
      if (error) {
        console.error('Database error in createItem:', error);
        throw error;
      }
      
      console.log('Created item:', data?.id);
      return data;
    } catch (error) {
      console.error('Error in inventoryApi.createItem:', error);
      throw error;
    }
  },

  async updateItem(id: string, updates: Partial<CreateInventoryItem>) {
    console.log('inventoryApi.updateItem called with id:', id);
    
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Database error in updateItem:', error);
        throw error;
      }
      
      console.log('Updated item:', data?.id);
      return data;
    } catch (error) {
      console.error('Error in inventoryApi.updateItem:', error);
      throw error;
    }
  },

  async deleteItem(id: string) {
    console.log('inventoryApi.deleteItem called with id:', id);
    
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) {
        console.error('Database error in deleteItem:', error);
        throw error;
      }
      
      console.log('Deleted item:', id);
    } catch (error) {
      console.error('Error in inventoryApi.deleteItem:', error);
      throw error;
    }
  },

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    console.log('inventoryApi.updateStock called with:', { id, quantity, operation });
    
    try {
      const { data: item } = await this.getItem(id);
      if (!item) throw new Error('Item not found');

      let newStock = Number(item.current_stock);
      const quantityNum = Number(quantity);
      
      switch (operation) {
        case 'add':
          newStock += quantityNum;
          break;
        case 'subtract':
          newStock = Math.max(0, newStock - quantityNum);
          break;
        case 'set':
          newStock = quantityNum;
          break;
      }

      console.log('Updating stock from', item.current_stock, 'to', newStock);

      return this.updateItem(id, { 
        current_stock: newStock,
        last_restocked_at: operation === 'add' ? new Date().toISOString() : undefined
      });
    } catch (error) {
      console.error('Error in inventoryApi.updateStock:', error);
      throw error;
    }
  },

  async getCategories() {
    console.log('inventoryApi.getCategories called');
    
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('category')
        .eq('is_active', true);
      
      if (error) {
        console.error('Database error in getCategories:', error);
        throw error;
      }
      
      const categories = [...new Set(data?.map(item => item.category) || [])];
      console.log('Retrieved categories:', categories.length);
      return categories;
    } catch (error) {
      console.error('Error in inventoryApi.getCategories:', error);
      throw error;
    }
  },

  async getLowStockItems() {
    console.log('inventoryApi.getLowStockItems called');
    return this.getItems(undefined, true);
  }
};
