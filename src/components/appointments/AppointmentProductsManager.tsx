import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  selling_price: number;
  current_stock: number;
}

interface AppointmentProduct {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface AppointmentProductsManagerProps {
  appointmentId: string;
  appointmentProducts: AppointmentProduct[];
  availableProducts: Product[];
  onProductsChange: () => void;
}

export const AppointmentProductsManager: React.FC<AppointmentProductsManagerProps> = ({
  appointmentId,
  appointmentProducts,
  availableProducts,
  onProductsChange
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const addProductMutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
      const product = availableProducts.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      if (product.current_stock < qty) {
        throw new Error('Insufficient stock');
      }

      const totalPrice = product.selling_price * qty;

      const { error } = await supabase
        .from('appointment_products')
        .insert({
          appointment_id: appointmentId,
          product_id: productId,
          quantity: qty,
          unit_price: product.selling_price,
          total_price: totalPrice
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-details'] });
      onProductsChange();
      setSelectedProductId('');
      setQuantity(1);
      toast({ title: 'Success', description: 'Product added successfully!' });
    },
    onError: (error: any) => {
      console.error('Error adding product:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add product', 
        variant: 'destructive' 
      });
    }
  });

  const removeProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('appointment_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-details'] });
      onProductsChange();
      toast({ title: 'Success', description: 'Product removed successfully!' });
    },
    onError: (error) => {
      console.error('Error removing product:', error);
      toast({ title: 'Error', description: 'Failed to remove product', variant: 'destructive' });
    }
  });

  const totalProductsPrice = appointmentProducts.reduce((sum, product) => sum + Number(product.total_price), 0);

  const handleAddProduct = () => {
    if (selectedProductId && quantity > 0) {
      addProductMutation.mutate({ productId: selectedProductId, qty: quantity });
    }
  };

  const getProductDetails = (productId: string) => {
    return availableProducts.find(p => p.id === productId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Products
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Products */}
        {appointmentProducts.map((product) => {
          const productDetails = getProductDetails(product.product_id);
          return (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div>
                <h4 className="font-medium">{productDetails?.name || 'Unknown Product'}</h4>
                <p className="text-sm text-gray-600">
                  ${product.unit_price} × {product.quantity} = ${product.total_price}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProductMutation.mutate(product.id)}
                disabled={removeProductMutation.isPending}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        {appointmentProducts.length === 0 && (
          <p className="text-gray-500 text-center py-4">No products added</p>
        )}

        <Separator />

        {/* Add New Product */}
        <div className="space-y-3">
          <h4 className="font-medium">Add Product</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts
                  .filter(product => product.current_stock > 0)
                  .map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.selling_price} (Stock: {product.current_stock})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Quantity"
            />
            <Button 
              onClick={handleAddProduct} 
              disabled={!selectedProductId || quantity <= 0 || addProductMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Products Summary */}
        {appointmentProducts.length > 0 && (
          <div className="pt-4 border-t bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Products Total:</span>
              <span className="font-bold text-green-600">${totalProductsPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
