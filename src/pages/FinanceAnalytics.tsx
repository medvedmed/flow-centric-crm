
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from '@/components/finance/AnalyticsDashboard';
import { AllOperationsList } from '@/components/finance/AllOperationsList';
import { IncomeExpenseBreakdown } from '@/components/finance/IncomeExpenseBreakdown';
import { AccountsOverview } from '@/components/finance/AccountsOverview';
import { AddTransactionDialog } from '@/components/finance/AddTransactionDialog';
import { TransactionDetailDialog } from '@/components/finance/TransactionDetailDialog';
import { Plus, BarChart3, List } from 'lucide-react';

const FinanceAnalytics = () => {
  const [activeView, setActiveView] = useState<'analytics' | 'operations'>('analytics');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Finance & Analytics</h1>
            <p className="text-gray-400 mt-1">Comprehensive financial management for your salon</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <Button
                variant={activeView === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-2 ${
                  activeView === 'analytics' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                variant={activeView === 'operations' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('operations')}
                className={`flex items-center gap-2 ${
                  activeView === 'operations' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                All Operations
              </Button>
            </div>
            
            {/* Add Transaction Button */}
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Operation
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {activeView === 'analytics' ? (
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <AnalyticsDashboard />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income & Expenses Breakdown */}
              <IncomeExpenseBreakdown />
              
              {/* Accounts Overview */}
              <AccountsOverview />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* All Operations List */}
            <AllOperationsList onTransactionClick={setSelectedTransaction} />
          </div>
        )}

        {/* Dialogs */}
        <AddTransactionDialog 
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
        
        <TransactionDetailDialog
          transaction={selectedTransaction}
          open={!!selectedTransaction}
          onOpenChange={(open) => !open && setSelectedTransaction(null)}
        />
      </div>
    </div>
  );
};

export default FinanceAnalytics;
