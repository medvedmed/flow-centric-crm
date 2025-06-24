import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, CreateInventoryItem } from '@/services/api/inventoryApi';
import { toast } from '@/hooks/use-toast';
import { Package, Plus, Search, AlertTriangle, Edit, Trash, TrendingDown, TrendingUp } from 'lucide-react';

export default function Inventory() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const [newItem, setNewItem] = useState<CreateInventoryItem>({
    name: '',
    description: '',
    category: 'General',
    sku: '',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: undefined,
    unit_price: 0,
    supplier_name: '',
    supplier_contact: ''
  });

  const [stockUpdate, setStockUpdate] = useState({
    itemId: '',
    quantity: 0,
    operation: 'add' as 'add' | 'subtract' | 'set'
  });

  const queryClient = useQueryClient();

  // Fetch inventory items
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory-items', selectedCategory, showLowStock],
    queryFn: () => inventoryApi.getItems(selectedCategory || undefined, showLowStock)
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: inventoryApi.getCategories
  });

  // Fetch low stock items for alerts
  const { data: lowStockItems } = useQuery({
    queryKey: ['low-stock-items'],
    queryFn: inventoryApi.getLowStockItems
  });

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: inventoryApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      setIsAddDialogOpen(false);
      resetNewItem();
      toast({
        title: "Success",
        description: "Item added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
    }
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateInventoryItem> }) =>
      inventoryApi.updateItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    }
  });

  // Update stock mutation
  const stockUpdateMutation = useMutation({
    mutationFn: ({ id, quantity, operation }: { id: string; quantity: number; operation: 'add' | 'subtract' | 'set' }) =>
      inventoryApi.updateStock(id, quantity, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      setStockUpdate({ itemId: '', quantity: 0, operation: 'add' });
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    }
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: inventoryApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  });

  const resetNewItem = () => {
    setNewItem({
      name: '',
      description: '',
      category: 'General',
      sku: '',
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: undefined,
      unit_price: 0,
      supplier_name: '',
      supplier_contact: ''
    });
  };

  const handleCreateItem = () => {
    if (!newItem.name || newItem.unit_price < 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(newItem);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      updates: editingItem
    });
  };

  const handleStockUpdate = () => {
    if (!stockUpdate.itemId || stockUpdate.quantity < 0) {
      toast({
        title: "Validation Error",
        description: "Please select an item and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    stockUpdateMutation.mutate({
      id: stockUpdate.itemId,
      quantity: stockUpdate.quantity,
      operation: stockUpdate.operation
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStockStatus = (item: any) => {
    if (item.current_stock <= item.minimum_stock) {
      return { status: 'low', color: 'text-red-600 bg-red-50' };
    } else if (item.current_stock <= item.minimum_stock * 1.5) {
      return { status: 'medium', color: 'text-yellow-600 bg-yellow-50' };
    }
    return { status: 'good', color: 'text-green-600 bg-green-50' };
  };

  const commonCategories = ['General', 'Hair Products', 'Skincare', 'Tools', 'Equipment', 'Cleaning Supplies'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, suppliers, and inventory costs</p>
        </div>

        <div className="flex gap-2">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Item name"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {commonCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>SKU</Label>
                  <Input
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    placeholder="Stock keeping unit"
                  />
                </div>

                <div>
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Current Stock</Label>
                  <Input
                    type="number"
                    value={newItem.current_stock}
                    onChange={(e) => setNewItem({ ...newItem, current_stock: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Minimum Stock</Label>
                  <Input
                    type="number"
                    value={newItem.minimum_stock}
                    onChange={(e) => setNewItem({ ...newItem, minimum_stock: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Maximum Stock</Label>
                  <Input
                    type="number"
                    value={newItem.maximum_stock || ''}
                    onChange={(e) => setNewItem({ ...newItem, maximum_stock: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    value={newItem.supplier_name}
                    onChange={(e) => setNewItem({ ...newItem, supplier_name: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Supplier Contact</Label>
                  <Input
                    value={newItem.supplier_contact}
                    onChange={(e) => setNewItem({ ...newItem, supplier_contact: e.target.value })}
                    placeholder="Phone or email"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Item description..."
                  />
                </div>

                <div className="col-span-2 flex gap-2 pt-4">
                  <Button onClick={handleCreateItem} disabled={createMutation.isPending} className="flex-1">
                    {createMutation.isPending ? "Adding..." : "Add Item"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-2">
              {lowStockItems.length} item(s) are running low on stock
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map(item => (
                <Badge key={item.id} variant="destructive">
                  {item.name} ({item.current_stock} left)
                </Badge>
              ))}
              {lowStockItems.length > 5 && (
                <Badge variant="outline">
                  +{lowStockItems.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stock Level</span>
                      <Badge className={stockStatus.color}>
                        {item.current_stock} units
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unit Price</span>
                      <span className="font-semibold">${Number(item.unit_price).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Value</span>
                      <span className="font-semibold">
                        ${(item.current_stock * Number(item.unit_price)).toFixed(2)}
                      </span>
                    </div>

                    {item.supplier_name && (
                      <div className="text-xs text-muted-foreground">
                        Supplier: {item.supplier_name}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStockUpdate({ 
                          itemId: item.id, 
                          quantity: 1, 
                          operation: 'add' 
                        })}
                        className="flex-1"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Add Stock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStockUpdate({ 
                          itemId: item.id, 
                          quantity: 1, 
                          operation: 'subtract' 
                        })}
                        className="flex-1"
                      >
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Use Stock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Items Found</p>
              <p>No inventory items match your current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Stock Update Dialog */}
      {stockUpdate.itemId && (
        <Dialog open={!!stockUpdate.itemId} onOpenChange={() => setStockUpdate({ itemId: '', quantity: 0, operation: 'add' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Operation</Label>
                <Select 
                  value={stockUpdate.operation} 
                  onValueChange={(value: 'add' | 'subtract' | 'set') => 
                    setStockUpdate({ ...stockUpdate, operation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="subtract">Remove Stock</SelectItem>
                    <SelectItem value="set">Set Stock Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: Number(e.target.value) })}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleStockUpdate} disabled={stockUpdateMutation.isPending} className="flex-1">
                  {stockUpdateMutation.isPending ? "Updating..." : "Update Stock"}
                </Button>
                <Button variant="outline" onClick={() => setStockUpdate({ itemId: '', quantity: 0, operation: 'add' })}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Item Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Item name"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={editingItem.category} onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>SKU</Label>
                <Input
                  value={editingItem.sku}
                  onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                  placeholder="Stock keeping unit"
                />
              </div>

              <div>
                <Label>Unit Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingItem.unit_price}
                  onChange={(e) => setEditingItem({ ...editingItem, unit_price: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  value={editingItem.current_stock}
                  onChange={(e) => setEditingItem({ ...editingItem, current_stock: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Minimum Stock</Label>
                <Input
                  type="number"
                  value={editingItem.minimum_stock}
                  onChange={(e) => setEditingItem({ ...editingItem, minimum_stock: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Maximum Stock</Label>
                <Input
                  type="number"
                  value={editingItem.maximum_stock || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, maximum_stock: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label>Supplier Name</Label>
                <Input
                  value={editingItem.supplier_name}
                  onChange={(e) => setEditingItem({ ...editingItem, supplier_name: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>

              <div className="col-span-2">
                <Label>Supplier Contact</Label>
                <Input
                  value={editingItem.supplier_contact}
                  onChange={(e) => setEditingItem({ ...editingItem, supplier_contact: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>

              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Item description..."
                />
              </div>

              <div className="col-span-2 flex gap-2 pt-4">
                <Button onClick={handleUpdateItem} disabled={updateMutation.isPending} className="flex-1">
                  {updateMutation.isPending ? "Updating..." : "Update Item"}
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
