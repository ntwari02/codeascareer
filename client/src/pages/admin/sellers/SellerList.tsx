import React, { useState, useMemo } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ToastContainer, useToast } from '@/components/ui/toast';
import {
  Store,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Ban,
  X,
  Trash2,
  MessageSquare,
  MoreVertical,
  Download,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';

type SellerStatus = 'active' | 'pending' | 'suspended' | 'rejected';
type KycStatus = 'verified' | 'pending' | 'rejected';

interface Seller {
  id: string;
  sellerName: string;
  storeName: string;
  email: string;
  phone: string;
  status: SellerStatus;
  kycStatus: KycStatus;
  totalProducts: number;
  totalOrders: number;
  earnings: number;
  joinDate: string;
  country: string;
  hasDisputes: boolean;
  hasPayoutIssues: boolean;
}

interface SellerListProps {
  onViewSeller: (sellerId: string) => void;
}

const mockSellers: Seller[] = [
  {
    id: 'SELL-001',
    sellerName: 'John Tech Store',
    storeName: 'TechHub Electronics',
    email: 'john@techhub.com',
    phone: '+1 555 123 4567',
    status: 'active',
    kycStatus: 'verified',
    totalProducts: 245,
    totalOrders: 1234,
    earnings: 125000,
    joinDate: '2023-01-15',
    country: 'United States',
    hasDisputes: false,
    hasPayoutIssues: false,
  },
  {
    id: 'SELL-002',
    sellerName: 'Sarah Fashion',
    storeName: 'Fashion Forward',
    email: 'sarah@fashion.com',
    phone: '+1 555 987 6543',
    status: 'pending',
    kycStatus: 'pending',
    totalProducts: 0,
    totalOrders: 0,
    earnings: 0,
    joinDate: '2024-03-10',
    country: 'Canada',
    hasDisputes: false,
    hasPayoutIssues: false,
  },
  {
    id: 'SELL-003',
    sellerName: 'Mike Home Decor',
    storeName: 'HomeStyle',
    email: 'mike@homestyle.com',
    phone: '+1 555 456 7890',
    status: 'suspended',
    kycStatus: 'verified',
    totalProducts: 89,
    totalOrders: 456,
    earnings: 45000,
    joinDate: '2023-06-20',
    country: 'United States',
    hasDisputes: true,
    hasPayoutIssues: false,
  },
  {
    id: 'SELL-004',
    sellerName: 'Emma Beauty',
    storeName: 'Beauty Essentials',
    email: 'emma@beauty.com',
    phone: '+1 555 321 0987',
    status: 'active',
    kycStatus: 'verified',
    totalProducts: 156,
    totalOrders: 892,
    earnings: 98000,
    joinDate: '2023-03-05',
    country: 'United Kingdom',
    hasDisputes: false,
    hasPayoutIssues: true,
  },
];

export default function SellerList({ onViewSeller }: SellerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerStatus | 'all'>('all');
  const [kycFilter, setKycFilter] = useState<KycStatus | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedSellers, setSelectedSellers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [messageSellerId, setMessageSellerId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  const filteredSellers = useMemo(() => {
    return mockSellers.filter((seller) => {
      const matchesSearch =
        seller.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
      const matchesKyc = kycFilter === 'all' || seller.kycStatus === kycFilter;
      const matchesCountry = countryFilter === 'all' || seller.country === countryFilter;
      return matchesSearch && matchesStatus && matchesKyc && matchesCountry;
    });
  }, [searchQuery, statusFilter, kycFilter, countryFilter]);

  const toggleSelectSeller = (sellerId: string) => {
    setSelectedSellers((prev) => {
      const next = new Set(prev);
      if (next.has(sellerId)) {
        next.delete(sellerId);
      } else {
        next.add(sellerId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedSellers.size === filteredSellers.length) {
      setSelectedSellers(new Set());
    } else {
      setSelectedSellers(new Set(filteredSellers.map((s) => s.id)));
    }
  };

  const handleMessage = (sellerId: string) => {
    setMessageSellerId(sellerId);
  };

  const handleApprove = (sellerId: string) => {
    // TODO: Implement approve seller functionality
    console.log('Approve seller:', sellerId);
    setOpenDropdownId(null);
    showToast(`Seller ${sellerId} approved successfully!`, 'success');
  };

  const handleSuspend = (sellerId: string) => {
    // TODO: Implement suspend seller functionality
    console.log('Suspend seller:', sellerId);
    setOpenDropdownId(null);
    showToast(`Seller ${sellerId} suspended successfully!`, 'success');
  };

  const handleDeactivate = (sellerId: string) => {
    // TODO: Implement deactivate seller functionality
    console.log('Deactivate seller:', sellerId);
    setOpenDropdownId(null);
    showToast(`Seller ${sellerId} deactivated successfully!`, 'success');
  };

  const handleDelete = (sellerId: string) => {
    // TODO: Implement delete seller functionality
    setOpenDropdownId(null);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Seller',
      message: `Are you sure you want to delete seller ${sellerId}? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: () => {
        console.log('Delete seller:', sellerId);
        showToast(`Seller ${sellerId} deleted successfully!`, 'success');
      },
    });
  };

  const handleResetPassword = (sellerId: string) => {
    // TODO: Implement reset password functionality
    console.log('Reset password for seller:', sellerId);
    setOpenDropdownId(null);
    showToast(`Password reset link sent to seller ${sellerId}!`, 'success');
  };

  const handleSendWarning = (sellerId: string) => {
    // TODO: Implement send warning functionality
    console.log('Send warning to seller:', sellerId);
    setOpenDropdownId(null);
    showToast(`Warning sent to seller ${sellerId}!`, 'warning');
  };

  const getStatusBadge = (status: SellerStatus) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
      rejected: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getKycBadge = (kyc: KycStatus) => {
    const styles = {
      verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[kyc]}`}>
        {kyc}
      </span>
    );
  };

  const countries = Array.from(new Set(mockSellers.map((s) => s.country)));

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Sellers • Management</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Store Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Approve, manage, and monitor seller stores across the platform
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-400">
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-400"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white">
            <Store className="h-5 w-5" />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Sellers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockSellers.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">+12 this month</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pending Approval</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockSellers.filter((s) => s.status === 'pending').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Need review</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Top Sellers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockSellers.filter((s) => s.totalOrders > 500).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">High performers</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">With Issues</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockSellers.filter((s) => s.hasDisputes || s.hasPayoutIssues).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Need attention</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={() => {
                setStatusFilter('all');
                setKycFilter('all');
                setCountryFilter('all');
              }}
              className="text-xs text-emerald-500 hover:text-emerald-600"
            >
              Clear all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SellerStatus | 'all')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">KYC Status</label>
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value as KycStatus | 'all')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">Country</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-3 pr-10 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setStatusFilter('active');
                    setKycFilter('verified');
                  }}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                >
                  Top Sellers
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    // Filter by disputes
                  }}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                >
                  With Disputes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Search by seller name, store, email, or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {selectedSellers.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSellers.size} selected
            </span>
            <button className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSellers.size === filteredSellers.length && filteredSellers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-4 py-3">Seller Name</th>
                <th className="px-4 py-3">Store Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSellers.has(seller.id)}
                      onChange={() => toggleSelectSeller(seller.id)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{seller.sellerName}</p>
                      <p className="text-xs text-gray-500">{seller.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{seller.storeName}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{seller.email}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{seller.phone}</td>
                  <td className="px-4 py-4">{getStatusBadge(seller.status)}</td>
                  <td className="px-4 py-4">{getKycBadge(seller.kycStatus)}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{seller.totalProducts}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{seller.totalOrders}</td>
                  <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                    ${seller.earnings.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(seller.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewSeller(seller.id)}
                        className="rounded-full border border-gray-200 p-2 text-xs text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                        title="View seller profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMessage(seller.id)}
                        className="rounded-full border border-gray-200 p-2 text-xs text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Message seller"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === seller.id ? null : seller.id)}
                          className="rounded-full border border-gray-200 p-2 text-xs text-gray-600 hover:border-amber-400 hover:bg-amber-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-amber-400 dark:hover:bg-amber-900/20 transition-colors"
                          title="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openDropdownId === seller.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                              <div className="py-1">
                                <button
                                  onClick={() => handleApprove(seller.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 dark:text-gray-300 dark:hover:bg-emerald-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    <span>Approve Seller</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleSuspend(seller.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 dark:text-gray-300 dark:hover:bg-amber-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <Ban className="h-4 w-4 text-amber-600" />
                                    <span>Suspend Seller</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleDeactivate(seller.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <X className="h-4 w-4 text-gray-600" />
                                    <span>Deactivate Account</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleResetPassword(seller.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-blue-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                    <span>Reset Password</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleSendWarning(seller.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-orange-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span>Send Warning</span>
                                  </div>
                                </button>
                                <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                                <button
                                  onClick={() => handleDelete(seller.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Seller</span>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSellers.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No sellers found matching your filters.</p>
        </div>
      )}

      {/* Message Modal */}
      {messageSellerId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setMessageSellerId(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Seller</h3>
              <button
                onClick={() => setMessageSellerId(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {(() => {
              const seller = mockSellers.find((s) => s.id === messageSellerId);
              return seller ? (
                <>
                  <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{seller.sellerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{seller.storeName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{seller.email}</p>
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      rows={6}
                      placeholder="Type your message here..."
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setMessageSellerId(null)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement send message functionality
                        showToast(`Message sent to ${seller.sellerName}!`, 'success');
                        setMessageSellerId(null);
                      }}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:from-emerald-600 hover:via-teal-500 hover:to-cyan-500"
                    >
                      Send Message
                    </button>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

