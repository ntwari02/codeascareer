import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, X, Calendar, Download, CreditCard, Plus, Trash2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Tier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    products: string;
    storage: string;
    analytics: boolean;
  };
  current?: boolean;
  popular?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
}

const SubscriptionTiers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plan' | 'billing' | 'payment'>('plan');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const tiers: Tier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      features: [
        'Up to 50 products',
        'Basic analytics',
        'Email support',
        'Standard payment processing',
      ],
      limits: {
        products: '50 products',
        storage: '5GB',
        analytics: false,
      },
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.99,
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Priority support',
        'Fast payment processing',
        'Custom branding',
        'API access',
      ],
      limits: {
        products: 'Unlimited',
        storage: '50GB',
        analytics: true,
      },
      current: true,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      features: [
        'Unlimited everything',
        'Real-time analytics',
        '24/7 dedicated support',
        'Instant payments',
        'White-label solution',
        'Advanced API',
        'Custom integrations',
      ],
      limits: {
        products: 'Unlimited',
        storage: 'Unlimited',
        analytics: true,
      },
    },
  ];

  const currentPlan = tiers.find(t => t.current) || tiers[1];
  const renewalDate = '2024-02-15';

  const [invoices] = useState<Invoice[]>([
    { id: 'INV-001', date: '2024-01-15', amount: 29.99, status: 'paid', plan: 'Premium' },
    { id: 'INV-002', date: '2023-12-15', amount: 29.99, status: 'paid', plan: 'Premium' },
    { id: 'INV-003', date: '2023-11-15', amount: 29.99, status: 'paid', plan: 'Premium' },
  ]);

  const [paymentMethods] = useState([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
    { id: '2', type: 'card', last4: '5678', brand: 'Mastercard', expiry: '06/26', isDefault: false },
  ]);

  const handleUpgrade = (tierId: string) => {
    setSelectedTier(tierId);
    setShowUpgradeModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <Crown className="w-8 h-8 text-red-400" />
            Subscription & Billing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Manage your subscription plan and billing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/30">
        {[
          { id: 'plan', label: 'Current Plan' },
          { id: 'billing', label: 'Billing History' },
          { id: 'payment', label: 'Payment Methods' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors duration-300 border-b-2 ${
              activeTab === tab.id
                ? 'border-red-500 text-red-500 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Current Plan Display */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-xl p-6 border border-red-200 dark:border-red-500/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-8 h-8 text-red-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{currentPlan.name} Plan</h2>
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mt-4 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Renewal Date: {renewalDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Product Limit: {currentPlan.limits.products}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Storage: {currentPlan.limits.storage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Analytics Access: {currentPlan.limits.analytics ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  ${currentPlan.price}
                  {currentPlan.price > 0 && <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border-2 ${
                    tier.popular ? 'border-red-500/50' : 'border-gray-200 dark:border-gray-700/30'
                  } relative transition-colors duration-300`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  {tier.current && (
                    <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                      Current Plan
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{tier.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">${tier.price}</span>
                      {tier.price > 0 && <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">/month</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      tier.current
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    }`}
                    disabled={tier.current}
                    onClick={() => !tier.current && handleUpgrade(tier.id)}
                  >
                    {tier.current ? 'Current Plan' : tier.price === 0 ? 'Get Started' : 'Upgrade'}
                    {!tier.current && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Billing History Tab */}
      {activeTab === 'billing' && (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-400" />
            Billing History
          </h2>
          <div className="space-y-3">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{invoice.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{invoice.date} • {invoice.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">${invoice.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                      invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-red-400" />
                Payment Methods
              </h2>
              <Button 
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={() => setShowAddCard(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Card
              </Button>
            </div>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50 transition-colors duration-300"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Expires {method.expiry}</p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                        Set as Default
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Money Payout (UI only) */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Mobile Money Payout</h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300">
                Configure your mobile money account for payouts
              </p>
              <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                Configure Mobile Money
              </Button>
            </div>
          </div>

          {/* Payout Schedule */}
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Payout Schedule</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Frequency</span>
                <select className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Next Payout</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">2024-01-22</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Upgrade Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You are about to upgrade to the {tiers.find(t => t.id === selectedTier)?.name} plan.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment will be processed securely</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${tiers.find(t => t.id === selectedTier)?.price}/month
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Confirm Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Card Modal */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add Payment Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddCard(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Add Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionTiers;
