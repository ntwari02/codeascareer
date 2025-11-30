import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function PaymentsFinancial() {
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    commissionIncome: 0,
    transactionFees: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
  });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  useEffect(() => {
    loadFinancialData();
  }, [filter]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Load orders for revenue calculation
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_status', 'completed');

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const commissionIncome = totalRevenue * 0.1; // 10% commission
      const transactionFees = totalRevenue * 0.03; // 3% transaction fee

      // Mock payout data (in real app, this would come from a payouts table)
      const mockPayouts = [
        {
          id: '1',
          seller_id: 'seller1',
          seller_name: 'John Seller',
          amount: 1500.00,
          status: 'pending',
          requested_at: new Date().toISOString(),
        },
        {
          id: '2',
          seller_id: 'seller2',
          seller_name: 'Jane Merchant',
          amount: 2300.50,
          status: 'approved',
          requested_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      setFinancialData({
        totalRevenue,
        commissionIncome,
        transactionFees,
        pendingPayouts: mockPayouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        completedPayouts: mockPayouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      });

      setPayouts(mockPayouts);
      setTransactions(orders?.slice(0, 20) || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    // Implement payout approval logic
    console.log('Approve payout:', payoutId);
    loadFinancialData();
  };

  const handleRejectPayout = async (payoutId: string, reason: string) => {
    // Implement payout rejection logic
    console.log('Reject payout:', payoutId, reason);
    loadFinancialData();
  };

  const filteredPayouts = filter === 'all' 
    ? payouts 
    : payouts.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments & Financial Control</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage platform finances, payouts, and transactions
        </p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${financialData.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission</h3>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${financialData.commissionIncome.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10% of revenue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Fees</h3>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${financialData.transactionFees.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3% of revenue</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Payouts</h3>
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200">
            ${financialData.pendingPayouts.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Completed</h3>
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-200">
            ${financialData.completedPayouts.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payouts Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payout Requests</h2>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status as any)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPayouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No payouts found</div>
          ) : (
            <div className="space-y-4">
              {filteredPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{payout.seller_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested: {new Date(payout.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${payout.amount.toFixed(2)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : payout.status === 'approved'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                  {payout.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprovePayout(payout.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectPayout(payout.id, '')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      #{transaction.order_number}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      ${transaction.total?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      ${((transaction.total || 0) * 0.1).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {transaction.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
