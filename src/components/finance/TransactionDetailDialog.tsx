
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, User, CreditCard, Tag, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionDetailDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDetailDialog: React.FC<TransactionDetailDialogProps> = ({ 
  transaction, 
  open, 
  onOpenChange 
}) => {
  if (!transaction) return null;

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'Cash': return 'Cash';
      case 'QNB Terminal': return 'QNB terminal';
      case 'LINK Payment': return 'LINK Payment';
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className={`p-2 rounded-full ${
              transaction.transaction_type === 'income' 
                ? 'bg-green-600/20 text-green-400' 
                : 'bg-red-600/20 text-red-400'
            }`}>
              {transaction.transaction_type === 'income' ? (
                <ArrowDownRight className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </div>
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount - Main Focus */}
          <div className="text-center py-4">
            <div className={`text-3xl font-bold ${
              transaction.transaction_type === 'income' 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {transaction.transaction_type === 'income' ? '+' : '-'}
              ${Number(transaction.amount).toFixed(2)}
            </div>
            <div className="text-gray-400 mt-1">
              <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}>
                {transaction.transaction_type === 'income' ? 'Income' : 'Expense'}
              </Badge>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Transaction Details */}
          <div className="space-y-4">
            {/* Client Name */}
            {transaction.client_name && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Client</div>
                  <div className="text-white font-medium">{transaction.client_name}</div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-400">Payment Method</div>
                <div className="text-white font-medium">
                  {getPaymentMethodDisplay(transaction.payment_method)}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-400">Category</div>
                <div className="text-white font-medium">{transaction.category}</div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-400">Date</div>
                <div className="text-white font-medium">
                  {format(new Date(transaction.transaction_date), 'MMMM dd, yyyy')}
                </div>
              </div>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-400">Description</div>
                  <div className="text-white">{transaction.description}</div>
                </div>
              </div>
            )}

            {/* Tip Badge */}
            {transaction.is_tip && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                    Tip
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-gray-700" />

          {/* Metadata */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Transaction ID: {transaction.id.slice(0, 8)}</div>
            <div>Created: {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</div>
            {transaction.invoice_id && (
              <div>Invoice: {transaction.invoice_id}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => {
                // Future: Edit functionality
                console.log('Edit transaction:', transaction.id);
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
