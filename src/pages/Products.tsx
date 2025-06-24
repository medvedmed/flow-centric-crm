
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku?: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  supplier_name?: string;
  supplier_contact?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...productData, salon_id: user?.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product created successfully!" });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product updated successfully!" });
      setEditingProduct(null);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product removed successfully!" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      sku: formData.get('sku') as string,
      cost_price: parseFloat(formData.get('cost_price') as string) || 0,
      selling_price: parseFloat(formData.get('selling_price') as string) || 0,
      current_stock: parseInt(formData.get('current_stock') as string) || 0,
      minimum_stock: parseInt(formData.get('minimum_stock') as string) || 0,
      maximum_stock: parseInt(formData.get('maximum_stock') as string) || null,
      supplier_name: formData.get('supplier_name') as string,
      supplier_contact: formData.get('supplier_contact') as string,
      is_active: true,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ ...productData, id: editingProduct.id });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.current_stock <= p.minimum_stock);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">Manage your salon products and inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Low Stock Alert ({lowStockProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <Badge variant="outline" className="text-orange-600">
                    {product.current_stock} / {product.minimum_stock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock:</span>
                  <span className={product.current_stock <= product.minimum_stock ? 'text-orange-600 font-semibold' : ''}>
                    {product.current_stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span>${product.cost_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Selling Price:</span>
                  <span className="font-semibold">${product.selling_price.toFixed(2)}</span>
                </div>
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SKU:</span>
                    <span className="text-sm">{product.sku}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm product={editingProduct} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ProductForm = ({ product, onSubmit }: { product?: Product; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
  <form onSubmit={onSubmit} className="grid gap-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={product?.category} required />
      </div>
    </div>
    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" name="description" defaultValue={product?.description} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" name="sku" defaultValue={product?.sku} />
      </div>
      <div>
        <Label htmlFor="current_stock">Current Stock</Label>
        <Input id="current_stock" name="current_stock" type="number" defaultValue={product?.current_stock} required />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="cost_price">Cost Price</Label>
        <Input id="cost_price" name="cost_price" type="number" step="0.01" defaultValue={product?.cost_price} />
      </div>
      <div>
        <Label htmlFor="selling_price">Selling Price</Label>
        <Input id="selling_price" name="selling_price" type="number" step="0.01" defaultValue={product?.selling_price} required />
      </div>
      <div>
        <Label htmlFor="minimum_stock">Min Stock</Label>
        <Input id="minimum_stock" name="minimum_stock" type="number" defaultValue={product?.minimum_stock} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="supplier_name">Supplier Name</Label>
        <Input id="supplier_name" name="supplier_name" defaultValue={product?.supplier_name} />
      </div>
      <div>
        <Label htmlFor="supplier_contact">Supplier Contact</Label>
        <Input id="supplier_contact" name="supplier_contact" defaultValue={product?.supplier_contact} />
      </div>
    </div>
    <Button type="submit" className="w-full">
      {product ? 'Update Product' : 'Create Product'}
    </Button>
  </form>
);

export default Products;
