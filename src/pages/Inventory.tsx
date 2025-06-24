
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/services/api/inventoryApi';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, AlertTriangle, Edit, Trash2, RefreshCw } from 'lucide-react';
import { InventoryErrorBoundary } from '@/components/InventoryErrorBoundary';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_price: number;
  description?: string;
  sku?: string;
  supplier_name?: string;
  supplier_contact?: string;
  is_active: boolean;
  last_restocked_at?: string;
}

const Inventory = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: '',
    unit_price: 0,
    description: '',
    sku: '',
    supplier_name: '',
    supplier_contact: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: inventoryApi.getItems
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: inventoryApi.getCategories
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['low-stock-items'],  
    queryFn: inventoryApi.getLowStockItems
  });

  const createMutation = useMutation({
    mutationFn: inventoryApi.createItem,
    onSuccess: () => {
      toast({ title: "Success", description: "Item added successfully!" });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryApi.updateItem(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Item updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      setEditingItem(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.deleteItem,
    onSuccess: () => {
      toast({ title: "Success", description: "Item deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'General',
      current_stock: 0,
      minimum_stock: 0,
      maximum_stock: '',
      unit_price: 0,
      description: '',
      sku: '',
      supplier_name: '',
      supplier_contact: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      maximum_stock: formData.maximum_stock ? parseInt(formData.maximum_stock) : null
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      maximum_stock: item.maximum_stock?.toString() || '',
      unit_price: item.unit_price,
      description: item.description || '',
      sku: item.sku || '',
      supplier_name: item.supplier_name || '',
      supplier_contact: item.supplier_contact || ''
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= 0) return 'out-of-stock';
    if (item.current_stock <= item.minimum_stock) return 'low-stock';
    return 'in-stock';
  };

  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item);
    switch (status) {
      case 'out-of-stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low-stock':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>;
      default:
        return <Badge variant="secondary">In Stock</Badge>;
    }
  };

  if (error) {
    return (
      <InventoryErrorBoundary>
        <div>Error loading inventory</div>
      </InventoryErrorBoundary>
    );
  }

  return (
    <InventoryErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Hair Care">Hair Care</SelectItem>
                        <SelectItem value="Styling Tools">Styling Tools</SelectItem>
                        <SelectItem value="Nail Care">Nail Care</SelectItem>
                        <SelectItem value="Skin Care">Skin Care</SelectItem>
                        <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_stock">Current Stock</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({...formData, current_stock: parseInt(e.target.value)})}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_stock">Minimum Stock</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({...formData, minimum_stock: parseInt(e.target.value)})}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maximum_stock">Maximum Stock (Optional)</Label>
                    <Input
                      id="maximum_stock"
                      type="number"
                      value={formData.maximum_stock}
                      onChange={(e) => setFormData({...formData, maximum_stock: e.target.value})}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_price">Unit Price</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU (Optional)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier_name">Supplier Name (Optional)</Label>
                    <Input
                      id="supplier_name"
                      value={formData.supplier_name}
                      onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier_contact">Supplier Contact (Optional)</Label>
                    <Input
                      id="supplier_contact"
                      value={formData.supplier_contact}
                      onChange={(e) => setFormData({...formData, supplier_contact: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 mb-2">
                {lowStockItems.length} item(s) running low on stock:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <Badge key={item.id} variant="outline" className="border-orange-500 text-orange-600">
                    {item.name} ({item.current_stock} left)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    {getStockBadge(item)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Stock:</span>
                      <span className="font-medium">{item.current_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Min Stock:</span>
                      <span>{item.minimum_stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Unit Price:</span>
                      <span>${item.unit_price.toFixed(2)}</span>
                    </div>
                    {item.sku && (
                      <div className="flex justify-between">
                        <span className="text-sm">SKU:</span>
                        <span className="text-xs font-mono">{item.sku}</span>
                      </div>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isLoading && items.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No inventory items yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first inventory item.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Hair Care">Hair Care</SelectItem>
                      <SelectItem value="Styling Tools">Styling Tools</SelectItem>
                      <SelectItem value="Nail Care">Nail Care</SelectItem>
                      <SelectItem value="Skin Care">Skin Care</SelectItem>
                      <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({...formData, current_stock: parseInt(e.target.value)})}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_stock">Minimum Stock</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({...formData, minimum_stock: parseInt(e.target.value)})}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maximum_stock">Maximum Stock (Optional)</Label>
                  <Input
                    id="maximum_stock"
                    type="number"
                    value={formData.maximum_stock}
                    onChange={(e) => setFormData({...formData, maximum_stock: e.target.value})}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit_price">Unit Price</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_name">Supplier Name (Optional)</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier_contact">Supplier Contact (Optional)</Label>
                  <Input
                    id="supplier_contact"
                    value={formData.supplier_contact}
                    onChange={(e) => setFormData({...formData, supplier_contact: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </InventoryErrorBoundary>
  );
};

export default Inventory;
