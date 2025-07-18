
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, Trash2, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface AvailableProduct {
  id: string;
  name: string;
  selling_price?: number;
  price?: number;
  current_stock: number;
}

interface ProductRowProps {
  products: Product[];
  availableProducts: AvailableProduct[];
  onAddProduct: (product: AvailableProduct, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  products,
  availableProducts,
  onAddProduct,
  onRemoveProduct
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddProduct = () => {
    const product = availableProducts.find(p => p.id === selectedProductId);
    if (product && quantity > 0) {
      onAddProduct(product, quantity);
      setSelectedProductId('');
      setQuantity(1);
      setIsDialogOpen(false);
    }
  };

  const totalProductsValue = products.reduce((sum, product) => sum + product.total, 0);

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-semibold text-purple-900">Products</span>
            {totalProductsValue > 0 && (
              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Total: ${totalProductsValue.toFixed(2)}
              </span>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product to Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Select Product</label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{product.name}</span>
                            <span className="ml-4 text-sm text-gray-500">
                              ${(product.selling_price || product.price || 0).toFixed(2)} 
                              • Stock: {product.current_stock}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    disabled={!selectedProductId || quantity <= 0}
                    className="flex-1"
                  >
                    Add Product
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products added yet</p>
            <p className="text-sm">Click "Add Product" to include retail items</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{product.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveProduct(product.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    ${product.price.toFixed(2)} × {product.quantity} = ${product.total.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            {totalProductsValue > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg border border-purple-200 font-semibold">
                <span>Products Subtotal:</span>
                <span className="text-purple-700">${totalProductsValue.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
