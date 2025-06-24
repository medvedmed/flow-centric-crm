
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Package, Plus, Minus, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/services/api/financeApi';
import { productSalesApi } from '@/services/api/productSalesApi';
import { inventoryApi } from '@/services/api/inventoryApi';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export const QuickPaymentInterface: React.FC = () => {
  // Service payment state
  const [serviceAmount, setServiceAmount] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePaymentMethod, setServicePaymentMethod] = useState('cash');

  // Product payment state
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [productPaymentMethod, setProductPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const queryClient = useQueryClient();

  const { data: inventory } = useQuery({
    queryKey: ['inventory', 'active'],
    queryFn: () => inventoryApi.getItems()
  });

  const servicePaymentMutation = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => {
      toast.success('Service payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setServiceAmount('');
      setServiceDescription('');
      setServicePaymentMethod('cash');
    },
    onError: (error) => {
      console.error('Failed to record service payment:', error);
      toast.error('Failed to record service payment');
    }
  });

  const productPaymentMutation = useMutation({
    mutationFn: async (products: ProductItem[]) => {
      const sales = await Promise.all(
        products.map(product => 
          productSalesApi.createSale({
            inventory_item_id: product.id,
            quantity: product.quantity,
            unit_selling_price: product.price,
            payment_method: productPaymentMethod,
            customer_name: customerName || undefined,
            customer_phone: customerPhone || undefined
          })
        )
      );
      return sales;
    },
    onSuccess: () => {
      toast.success('Product sales recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelectedProducts([]);
      setCustomerName('');
      setCustomerPhone('');
      setProductPaymentMethod('cash');
    },
    onError: (error) => {
      console.error('Failed to record product sales:', error);
      toast.error('Failed to record product sales');
    }
  });

  const handleServicePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(serviceAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!serviceDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    servicePaymentMutation.mutate({
      transaction_type: 'income',
      category: 'Service Revenue',
      amount,
      description: serviceDescription,
      payment_method: servicePaymentMethod,
      transaction_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleProductPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Check stock availability
    const stockIssues = selectedProducts.filter(product => product.quantity > product.stock);
    if (stockIssues.length > 0) {
      toast.error('Not enough stock for selected quantities');
      return;
    }

    productPaymentMutation.mutate(selectedProducts);
  };

  const addProduct = (item: any) => {
    const existingProduct = selectedProducts.find(p => p.id === item.id);
    if (existingProduct) {
      setSelectedProducts(products =>
        products.map(p =>
          p.id === item.id
            ? { ...p, quantity: Math.min(p.quantity + 1, p.stock) }
            : p
        )
      );
    } else {
      setSelectedProducts(products => [
        ...products,
        {
          id: item.id,
          name: item.name,
          price: item.selling_price || item.unit_price,
          quantity: 1,
          stock: item.current_stock
        }
      ]);
    }
    setProductSearch('');
  };

  const updateProductQuantity = (id: string, quantity: number) => {
    setSelectedProducts(products =>
      products.map(p =>
        p.id === id ? { ...p, quantity: Math.max(0, Math.min(quantity, p.stock)) } : p
      ).filter(p => p.quantity > 0)
    );
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(products => products.filter(p => p.id !== id));
  };

  const filteredInventory = inventory?.filter(item =>
    item.current_stock > 0 &&
    (item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
     item.category.toLowerCase().includes(productSearch.toLowerCase()))
  ) || [];

  const productTotal = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Quick Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="service" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="service" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Service
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="space-y-4">
            <form onSubmit={handleServicePayment} className="space-y-4">
              <div>
                <Label htmlFor="service-amount">Amount</Label>
                <Input
                  id="service-amount"
                  type="number"
                  placeholder="0.00"
                  value={serviceAmount}
                  onChange={(e) => setServiceAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="service-description">Description</Label>
                <Input
                  id="service-description"
                  placeholder="Service description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="service-payment-method">Payment Method</Label>
                <Select value={servicePaymentMethod} onValueChange={setServicePaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={servicePaymentMutation.isPending}
              >
                {servicePaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <form onSubmit={handleProductPayment} className="space-y-4">
              {/* Product Search */}
              <div>
                <Label htmlFor="product-search">Search Products</Label>
                <Input
                  id="product-search"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                {productSearch && filteredInventory.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                    {filteredInventory.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addProduct(item)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <div className="text-xs text-gray-600">
                              Stock: {item.current_stock} • ${item.selling_price || item.unit_price}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div>
                  <Label>Selected Products</Label>
                  <div className="space-y-2 mt-2">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">${product.price} each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{product.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer-name">Customer Name (Optional)</Label>
                  <Input
                    id="customer-name"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Customer Phone (Optional)</Label>
                  <Input
                    id="customer-phone"
                    placeholder="Customer phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="product-payment-method">Payment Method</Label>
                <Select value={productPaymentMethod} onValueChange={setProductPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProducts.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total:</span>
                    <span className="text-lg">${productTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={productPaymentMutation.isPending || selectedProducts.length === 0}
              >
                {productPaymentMutation.isPending ? 'Recording...' : 'Record Sales'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
