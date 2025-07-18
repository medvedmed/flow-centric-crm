
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

interface ProductRowProps {
  products: any[];
  onProductsChange: (products: any[]) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  products,
  onProductsChange
}) => {
  const addProduct = () => {
    // For now, just show the structure - will be implemented later
    console.log('Add product clicked');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-semibold text-purple-900">Products</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addProduct}
            className="hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>
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
            {products.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span>{product.name}</span>
                <span>${product.total}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
