import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  User,
  DollarSign,
  Link,
  BarChart3,
  Download,
  Edit,
  Eye,
} from 'lucide-react';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  commissionRate: number;
  totalConversions: number;
  totalEarnings: number;
  pendingEarnings: number;
  uniqueLink: string;
  status: 'active' | 'inactive';
}

const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    name: 'John Influencer',
    email: 'john@example.com',
    commissionRate: 10,
    totalConversions: 245,
    totalEarnings: 2450,
    pendingEarnings: 450,
    uniqueLink: 'ref/john123',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Marketer',
    email: 'sarah@example.com',
    commissionRate: 8,
    totalConversions: 189,
    totalEarnings: 1512,
    pendingEarnings: 320,
    uniqueLink: 'ref/sarah456',
    status: 'active',
  },
];

export default function AffiliateProgramManagement() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(mockAffiliates);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Affiliate Program Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage affiliates and track commission payouts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
        >
          <Plus className="mr-2 inline h-4 w-4" />
          Add Affiliate
        </button>
      </div>

      {/* Affiliates Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Total Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Pending
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {affiliates.map((affiliate) => (
                <tr
                  key={affiliate.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {affiliate.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{affiliate.email}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Link className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {affiliate.uniqueLink}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {affiliate.commissionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {affiliate.totalConversions}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${affiliate.totalEarnings.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      ${affiliate.pendingEarnings.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-emerald-400 dark:border-gray-700 dark:text-gray-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-emerald-400 dark:border-gray-700 dark:text-gray-300">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-emerald-400 dark:border-gray-700 dark:text-gray-300">
                        <DollarSign className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

