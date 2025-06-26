
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Package, AlertTriangle, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { inventoryApi } from '@/services/api/inventoryApi';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

const Inventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  console.log('Inventory component rendering');

  // Enable real-time updates
  useRealTimeUpdates();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory-items', selectedCategory, showLowStock],
    queryFn: () => inventoryApi.getItems(selectedCategory || undefined, showLowStock),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => inventoryApi.getCategories(),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: () => inventoryApi.getLowStockItems(),
    retry: 1,
    retryDelay: 1000,
  });

  const createItemMutation = useMutation({
    mutationFn: inventoryApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast({ title: 'Success', description: 'Item created successfully!' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error('Create item mutation error:', error);
      toast({ title: 'Error', description: 'Failed to create item', variant: 'destructive' });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, quantity, operation }: { id: string; quantity: number; operation: 'add' | 'subtract' | 'set' }) => 
      inventoryApi.updateStock(id, quantity, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast({ title: 'Success', description: 'Stock updated successfully!' });
    },
    onError: (error) => {
      console.error('Update stock mutation error:', error);
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
    },
  });

  const handleCreateItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      sku: formData.get('sku') as string,
      current_stock: parseInt(formData.get('current_stock') as string),
      minimum_stock: parseInt(formData.get('minimum_stock') as string),
      maximum_stock: parseInt(formData.get('maximum_stock') as string) || undefined,
      unit_price: parseFloat(formData.get('unit_price') as string),
      supplier_name: formData.get('supplier_name') as string,
      supplier_contact: formData.get('supplier_contact') as string,
    };

    console.log('Creating item with data:', itemData);
    createItemMutation.mutate(itemData);
  };

  const handleStockUpdate = (itemId: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
    console.log('Updating stock:', { itemId, quantity, operation });
    updateStockMutation.mutate({ id: itemId, quantity, operation });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    console.log('Inventory page loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Inventory page error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-4">Failed to load inventory data. Please try again.</p>
            <p className="text-sm text-gray-500">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Inventory page rendered successfully with', items.length, 'items');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your salon inventory</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" name="category" required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" />
                </div>
                <div>
                  <Label htmlFor="unit_price">Unit Price *</Label>
                  <Input id="unit_price" name="unit_price" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="current_stock">Current Stock *</Label>
                  <Input id="current_stock" name="current_stock" type="number" required />
                </div>
                <div>
                  <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                  <Input id="minimum_stock" name="minimum_stock" type="number" required />
                </div>
                <div>
                  <Label htmlFor="maximum_stock">Maximum Stock</Label>
                  <Input id="maximum_stock" name="maximum_stock" type="number" />
                </div>
                <div>
                  <Label htmlFor="supplier_name">Supplier Name</Label>
                  <Input id="supplier_name" name="supplier_name" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="supplier_contact">Supplier Contact</Label>
                <Input id="supplier_contact" name="supplier_contact" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createItemMutation.isPending}>
                  {createItemMutation.isPending ? 'Creating...' : 'Create Item'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {lowStockItems.length} item(s) running low on stock
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                </div>
                {item.current_stock < item.minimum_stock && (
                  <Badge variant="destructive">Low Stock</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="font-semibold">{item.current_stock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Minimum Stock:</span>
                <span className="text-sm">{item.minimum_stock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="text-sm">${item.unit_price}</span>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStockUpdate(item.id, 1, 'add')}
                  disabled={updateStockMutation.isPending}
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStockUpdate(item.id, 1, 'subtract')}
                  disabled={updateStockMutation.isPending}
                >
                  -1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newStock = prompt('Enter new stock amount:', item.current_stock.toString());
                    if (newStock && !isNaN(parseInt(newStock))) {
                      handleStockUpdate(item.id, parseInt(newStock), 'set');
                    }
                  }}
                  disabled={updateStockMutation.isPending}
                >
                  Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory || showLowStock
                ? 'No items match your current filters.'
                : 'Start by adding your first inventory item.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
