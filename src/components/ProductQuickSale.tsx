
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, Package, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/services/api/inventoryApi';
import { productSalesApi } from '@/services/api/productSalesApi';
import { ProductSaleDialog } from './ProductSaleDialog';

export const ProductQuickSale: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', 'active'],
    queryFn: () => inventoryApi.getItems()
  });

  const { data: todaysSales } = useQuery({
    queryKey: ['product-sales', 'today'],
    queryFn: () => productSalesApi.getTodaysSales()
  });

  const { data: salesStats } = useQuery({
    queryKey: ['product-sales', 'stats', 'today'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0];
      return productSalesApi.getSalesStats(today, today);
    }
  });

  const filteredInventory = inventory?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const lowStockItems = inventory?.filter(item => item.current_stock <= item.minimum_stock) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Product Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Product Sales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${salesStats?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {salesStats?.totalSales || 0}
            </div>
            <div className="text-xs text-gray-600">Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${salesStats?.totalProfit.toFixed(2) || '0.00'}
            </div>
            <div className="text-xs text-gray-600">Profit</div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Low Stock Alert</span>
            </div>
            <div className="text-xs text-red-700">
              {lowStockItems.length} item(s) running low on stock
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Product List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No products found' : 'No products available'}
            </div>
          ) : (
            filteredInventory.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.current_stock <= item.minimum_stock && (
                      <Badge variant="destructive" className="text-xs">Low</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <span>Stock: {item.current_stock}</span>
                    <span>•</span>
                    <span>${item.selling_price || item.unit_price}</span>
                  </div>
                </div>
                <ProductSaleDialog 
                  item={{
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    selling_price: item.selling_price || item.unit_price,
                    current_stock: item.current_stock,
                    sku: item.sku
                  }}
                  trigger={
                    <Button 
                      size="sm" 
                      disabled={item.current_stock === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </Button>
                  }
                />
              </div>
            ))
          )}
        </div>

        {/* Recent Sales */}
        {todaysSales && todaysSales.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Today's Sales</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {todaysSales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                  <span>{sale.inventory_items?.name} x{sale.quantity}</span>
                  <span className="font-medium">${sale.total_revenue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
