import React from 'react';
import { LifeBuoy, Mail, MessageCircle, FileText, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SupportCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <LifeBuoy className="w-8 h-8 text-red-400" />
            Support Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm transition-colors duration-300">
            Access help articles, contact support, and track open tickets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200 dark:border-gray-700/60 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors duration-300">
              <FileText className="w-5 h-5 text-red-400" />
              Help & Documentation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <button className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Getting started with Seller Hub
              </button>
              <button className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Managing B2B RFQs and quotes
              </button>
              <button className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Disputes & chargebacks playbook
              </button>
              <button className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Payouts, fees & billing FAQ
              </button>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200 dark:border-gray-700/60 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors duration-300">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Open Support Tickets (demo)
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              This is a placeholder UI. In production, your active tickets would be listed here.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">#TCK-1024 • Payout delay</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Opened 2 days ago • Priority: High</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-[11px] text-yellow-700 dark:text-yellow-300">
                  In review
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200 dark:border-gray-700/60 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors duration-300">
              <Mail className="w-5 h-5 text-red-400" />
              Contact Support
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Reach out to our helpdesk team for account, billing, or technical issues.
            </p>
            <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-sm">
              Open support ticket
            </Button>
          </div>

          <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-gray-200 dark:border-gray-700/60 transition-colors duration-300">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors duration-300">
              <MessageCircle className="w-5 h-5 text-red-400" />
              Live Chat (demo)
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Chat with a support specialist in real time during business hours.
            </p>
            <Button variant="outline" className="w-full border-gray-300 dark:border-gray-700 text-sm">
              Start chat
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;


