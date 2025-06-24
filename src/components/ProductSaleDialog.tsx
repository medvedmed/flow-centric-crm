
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productSalesApi } from '@/services/api/productSalesApi';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  selling_price: number;
  current_stock: number;
  sku?: string;
}

interface ProductSaleDialogProps {
  item: InventoryItem;
  trigger?: React.ReactNode;
}

export const ProductSaleDialog: React.FC<ProductSaleDialogProps> = ({ item, trigger }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(item.selling_price);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const createSaleMutation = useMutation({
    mutationFn: productSalesApi.createSale,
    onSuccess: () => {
      toast.success('Product sale recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['product-sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to record product sale:', error);
      toast.error('Failed to record product sale');
    }
  });

  const resetForm = () => {
    setQuantity(1);
    setSellingPrice(item.selling_price);
    setPaymentMethod('cash');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity > item.current_stock) {
      toast.error('Not enough stock available');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    createSaleMutation.mutate({
      inventory_item_id: item.id,
      quantity,
      unit_selling_price: sellingPrice,
      payment_method: paymentMethod,
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
      notes: notes || undefined
    });
  };

  const total = quantity * sellingPrice;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Sell
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-600">Stock: {item.current_stock}</p>
            <p className="text-sm text-gray-600">Price: ${item.selling_price}</p>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={item.current_stock}
                className="text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(item.current_stock, quantity + 1))}
                disabled={quantity >= item.current_stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="selling-price">Selling Price</Label>
            <Input
              id="selling-price"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.01}
            />
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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

          <div>
            <Label htmlFor="customer-name">Customer Name (Optional)</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <Label htmlFor="customer-phone">Customer Phone (Optional)</Label>
            <Input
              id="customer-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter customer phone"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this sale"
              rows={2}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center font-medium">
              <span>Total:</span>
              <span className="text-lg">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSaleMutation.isPending}
              className="flex-1"
            >
              {createSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
