import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ShoppingBag,
  CheckCircle,
  Mail,
  Phone,
  Settings,
  Shield,
  Zap,
  ChevronDown,
  Loader2,
  X,
} from 'lucide-react';

type CustomerStatus = 'active' | 'banned' | 'pending';
type KycStatus = 'verified' | 'pending' | 'rejected';
type StaffRole = 'Super Admin' | 'Operations' | 'Support' | 'Finance' | 'Catalog';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  kyc: KycStatus;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  tickets: number;
  notes: string;
}

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  lastActive: string;
  mfa: boolean;
  status: 'active' | 'locked';
}

interface SyncScope {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SyncLog {
  timestamp: string;
  detail: string;
}

type NewCustomerForm = {
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  kyc: KycStatus;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  tickets: number;
  notes: string;
};

const customers: CustomerRecord[] = [
  {
    id: 'CUS-1024',
    name: 'Diane Akimana',
    email: 'diane@clients.com',
    phone: '+250 788 120 220',
    status: 'active',
    kyc: 'verified',
    orders: 54,
    totalSpent: 128600,
    lastOrder: 'Mar 18, 2024',
    tickets: 1,
    notes: 'Fashion buyer · Kigali RW',
  },
  {
    id: 'CUS-1091',
    name: 'Samuel Keita',
    email: 'samuel@clients.com',
    phone: '+225 05 20 33 44',
    status: 'pending',
    kyc: 'pending',
    orders: 8,
    totalSpent: 6400,
    lastOrder: 'Mar 11, 2024',
    tickets: 0,
    notes: 'Electronics reseller · Abidjan CI',
  },
  {
    id: 'CUS-0871',
    name: 'Lena Fofana',
    email: 'lena@clients.com',
    phone: '+221 77 102 4586',
    status: 'banned',
    kyc: 'rejected',
    orders: 112,
    totalSpent: 20120,
    lastOrder: 'Feb 01, 2024',
    tickets: 4,
    notes: 'Chargeback abuse · Dakar SN',
  },
];

const staffMembers: StaffRecord[] = [
  {
    id: 'ADM-001',
    name: 'Brian Otieno',
    email: 'brian@reaglex.com',
    role: 'Operations',
    lastActive: '4m ago',
    mfa: true,
    status: 'active',
  },
  {
    id: 'ADM-008',
    name: 'Mei Chen',
    email: 'mei@reaglex.com',
    role: 'Finance',
    lastActive: 'Locked 1h ago',
    mfa: false,
    status: 'locked',
  },
  {
    id: 'ADM-014',
    name: 'Lamia Yusuf',
    email: 'lamia@reaglex.com',
    role: 'Support',
    lastActive: '19m ago',
    mfa: true,
    status: 'active',
  },
];

const permissionMatrix = [
  {
    module: 'Customers',
    permissions: { view: true, edit: true, delete: false, approve: false },
  },
  {
    module: 'Sellers',
    permissions: { view: true, edit: true, delete: true, approve: true },
  },
  {
    module: 'Products',
    permissions: { view: true, edit: true, delete: true, approve: true },
  },
  {
    module: 'Orders',
    permissions: { view: true, edit: true, delete: false, approve: true },
  },
  {
    module: 'Finance',
    permissions: { view: true, edit: false, delete: false, approve: true },
  },
  {
    module: 'Support',
    permissions: { view: true, edit: true, delete: false, approve: true },
  },
];

export default function UserManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'customers' | 'staff' | 'roles'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [customerRows, setCustomerRows] = useState<CustomerRecord[]>(customers);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    kyc: 'pending',
    orders: 0,
    totalSpent: 0,
    lastOrder: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    tickets: 0,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncScopes, setSyncScopes] = useState<SyncScope[]>([
    {
      id: 'customers',
      label: 'Customers',
      description: 'Status, orders, balances, and watch-lists',
      enabled: true,
    },
    {
      id: 'staff',
      label: 'Admins & staff',
      description: 'Accounts, MFA status, policy acknowledgements',
      enabled: true,
    },
    {
      id: 'roles',
      label: 'Roles & permissions',
      description: 'RBAC templates, overrides, escalations',
      enabled: true,
    },
  ]);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    { timestamp: '09:20', detail: 'Last sync completed successfully (2 modules)' },
    { timestamp: '08:05', detail: 'Flagged 3 pending KYC accounts for review' },
  ]);
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  const tabMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (tabMenuRef.current && !tabMenuRef.current.contains(event.target as Node)) {
        setTabMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!syncing) return;
    setSyncProgress(0);
    const intervalId = window.setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(intervalId);
          setSyncing(false);
          setSyncLogs((logs) => [
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              detail: 'Directory sync completed without issues',
            },
            ...logs,
          ]);
          return 100;
        }
        return Math.min(prev + 8, 100);
      });
    }, 350);
    return () => window.clearInterval(intervalId);
  }, [syncing]);

  const toggleSyncScope = (scopeId: string) => {
    setSyncScopes((prev) =>
      prev.map((scope) => (scope.id === scopeId ? { ...scope, enabled: !scope.enabled } : scope)),
    );
  };

  const handleStartSync = () => {
    if (!syncScopes.some((scope) => scope.enabled)) {
      setSyncError('Select at least one module to sync');
      return;
    }
    const enabledCount = syncScopes.filter((scope) => scope.enabled).length;
    setSyncError(null);
    setSyncProgress(0);
    setSyncing(true);
    setSyncLogs((logs) => [
      {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detail: `Sync started for ${enabledCount} module${enabledCount > 1 ? 's' : ''}`,
      },
      ...logs,
    ]);
  };

  const closeSyncModal = () => {
    setSyncModalOpen(false);
    setSyncError(null);
    setSyncing(false);
    setSyncProgress(0);
  };

  const closeAddUserModal = () => {
    setAddUserOpen(false);
    resetForm();
  };

  const filteredCustomers = useMemo(() => {
    return customerRows.filter((customer) => {
      const matchesQuery =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [searchQuery, statusFilter, customerRows]);

  const resetForm = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      kyc: 'pending',
      orders: 0,
      totalSpent: 0,
      lastOrder: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tickets: 0,
      notes: '',
    });
    setFormErrors({});
  };

  const handleAddUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!newCustomer.name.trim()) errors.name = 'Full name is required';
    if (!newCustomer.email.trim()) errors.email = 'Email is required';
    if (!newCustomer.phone.trim()) errors.phone = 'Phone is required';
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    const id = `CUS-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: CustomerRecord = {
      id,
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim(),
      phone: newCustomer.phone.trim(),
      status: newCustomer.status,
      kyc: newCustomer.kyc,
      orders: newCustomer.orders || 0,
      totalSpent: newCustomer.totalSpent || 0,
      lastOrder: newCustomer.lastOrder,
      tickets: newCustomer.tickets || 0,
      notes: newCustomer.notes.trim() || 'New customer record',
    };
    setCustomerRows((prev) => [record, ...prev]);
    setAddUserOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Users • Intelligence</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management Hub</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Control buyers, staff, and authorization policies across the Reaglex platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSyncModalOpen(true);
              setSyncError(null);
            }}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-400"
          >
            <Settings className="h-4 w-4" /> Sync Directory
          </button>
          <button
            onClick={() => {
              resetForm();
              setAddUserOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-emerald-400"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
          <div className="flex flex-1 items-center justify-end">
            <div ref={tabMenuRef} className="relative">
              <button
                onClick={() => setTabMenuOpen((state) => !state)}
                className="flex items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-white dark:border-gray-700"
              >
                {activeTab === 'customers' ? 'Customers' : activeTab === 'staff' ? 'Admins & Staff' : 'Roles & Permissions'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {tabMenuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 text-sm shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                  {[
                    { id: 'customers', label: 'Customers' },
                    { id: 'staff', label: 'Admins & Staff' },
                    { id: 'roles', label: 'Roles & Permissions' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        setTabMenuOpen(false);
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left ${
                        activeTab === tab.id
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {activeTab === 'customers' && (
        <>
          <section className="grid gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Customers" value="42,190" helper="+12.4% vs last month" />
            <StatCard icon={ShoppingBag} label="Avg Orders / Customer" value="4.8" helper="+0.5 trend" />
            <StatCard icon={AlertTriangle} label="Risk Accounts" value="64" helper="Need manual review" tone="warning" />
            <StatCard icon={ShieldCheck} label="Verified KYC" value="91%" helper="+3% compliance" tone="success" />
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Search by name, email, phone or ID"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold ${
                    statusFilter === 'all'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300'
                      : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  <Filter className="h-4 w-4" /> All Status
                </button>
                {(['active', 'pending', 'banned'] as const).map((status) => (
                  <button
                    key={status}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${
                      statusFilter === status
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400 dark:text-emerald-300'
                        : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden scroll-smooth rounded-xl border border-gray-100 dark:border-gray-800 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">KYC</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Total spent</th>
                    <th className="px-4 py-3">Last order</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {customer.email}
                          </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {customer.phone}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={statusTone(customer.status)}>{customer.status}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={customer.kyc === 'verified' ? 'success' : customer.kyc === 'pending' ? 'warning' : 'danger'}>
                          {customer.kyc}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">{customer.orders}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                        ${customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{customer.lastOrder}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-full border border-gray-200 p-2 text-xs text-gray-600 hover:border-emerald-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-emerald-400">
                            View
                          </button>
                          <button className="rounded-full border border-gray-200 p-2 text-xs text-gray-600 hover:border-amber-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-amber-400">
                            Warn
                          </button>
                          <button className="rounded-full border border-gray-200 p-2 text-xs text-gray-600 hover:border-red-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-400">
                            Ban
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Support Tickets</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live queue · assignable</p>
              <div className="space-y-3 text-sm">
                {customerRows
                  .filter((customer) => customer.tickets > 0)
                  .map((customer) => (
                    <div key={customer.id} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{customer.name}</span>
                        <span>{customer.tickets} open</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{customer.notes}</p>
                      <button 
                        onClick={() => navigate('/admin/support', { state: { customerId: customer.id, customerName: customer.name } })}
                        className="mt-2 text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        Open ticket
                      </button>
              </div>
                  ))}
          </div>
        </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">After-Sales</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Refunds · returns · replacements</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• 12 refund requests awaiting review</li>
                <li>• 5 return parcels in transit</li>
                <li>• 3 replacement orders approved today</li>
                <li>• SLA: 94% resolved under 48h</li>
              </ul>
              <button 
                onClick={() => navigate('/admin/finance', { state: { section: 'refunds' } })}
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Open resolution center
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notes & Highlights</h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>• Segment VIP buyers for Ramadan sale campaign.</p>
                <p>• Alert: high-risk cluster flagged for duplicate cards.</p>
                <p>• Launch loyalty upgrade for wholesalers.</p>
                <p>• Compliance: KYC backlog ETA 72h.</p>
              </div>
              <button 
                onClick={() => {
                  // Navigate to users page (current page) and scroll to top, or could open a CRM modal in the future
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  // Could also navigate to a dedicated CRM page if it exists: navigate('/admin/crm');
                }}
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                View CRM workspace
              </button>
            </div>
          </section>
        </>
      )}
      {activeTab === 'staff' && (
        <section className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Staff Accounts" value="24" helper="Licensed seats" />
            <StatCard icon={Shield} label="MFA Coverage" value="78%" helper="Target 100%" tone="warning" />
            <StatCard icon={AlertTriangle} label="Locked Accounts" value="2" helper="Security review" tone="danger" />
            <StatCard icon={Zap} label="Active Sessions" value="14" helper="Realtime usage" tone="success" />
            </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Admins & Staff</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Role-based access control • audit-ready</p>
              </div>
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                Invite staff
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Staff</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">MFA</th>
                    <th className="px-4 py-3 text-right">Last active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {staffMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.id}</p>
                </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{member.email}</td>
                      <td className="px-4 py-4">
                        <Badge tone="neutral">{member.role}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={member.status === 'active' ? 'success' : 'danger'}>{member.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {member.mfa ? (
                          <span className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle className="h-4 w-4" /> Enabled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500">
                            <AlertTriangle className="h-4 w-4" /> Missing
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-500">{member.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'roles' && (
        <section className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <RoleCard title="Super Admin" members={2} description="Full platform access" />
            <RoleCard title="Operations" members={6} description="Sellers, logistics, orders" />
            <RoleCard title="Support" members={5} description="Tickets & disputes" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Permission Matrix</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Module-level control</p>
              </div>
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                New role
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Module</th>
                    <th className="px-4 py-3">View</th>
                    <th className="px-4 py-3">Create</th>
                    <th className="px-4 py-3">Edit</th>
                    <th className="px-4 py-3">Delete</th>
                    <th className="px-4 py-3">Approve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {permissionMatrix.map((row) => (
                    <tr key={row.module} className="text-center">
                      <td className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">{row.module}</td>
                      {['view', 'create', 'edit', 'delete', 'approve'].map((perm) => (
                        <td key={perm} className="px-4 py-3">
                          <input
                            type="checkbox"
                            readOnly
                            checked={row.permissions[perm as keyof typeof row.permissions]}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Policy Highlights</h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <li>• Dual approval required for Finance role changes.</li>
                <li>• Temporary access auto-expires after 14 days.</li>
                <li>• All staff must re-acknowledge policy every quarter.</li>
                <li>• Exported logs stored securely for 12 months.</li>
              </ul>
              <button className="text-xs font-semibold text-emerald-500">Download policy PDF</button>
          </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Access Exception Queue</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Emergency finance edit</p>
                    <p className="text-xs text-gray-500">Approved · expires in 3 days</p>
                  </div>
                  <button className="text-xs text-emerald-500">Review</button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Support cross-region access</p>
                    <p className="text-xs text-gray-500">Pending security approval</p>
                  </div>
                  <button className="text-xs text-emerald-500">Approve</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {syncModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={closeSyncModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeSyncModal}
              className="absolute right-4 top-4 rounded-full border border-gray-200 p-1.5 text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white"
              aria-label="Close sync modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Directory Sync</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Supabase identity sync</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Align customer, staff, and authorization modules with upstream sources.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Scopes to include</p>
                <div className="space-y-3">
                  {syncScopes.map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => toggleSyncScope(scope.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        scope.enabled
                          ? 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/80 dark:bg-emerald-500/10'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                            scope.enabled
                              ? 'border-emerald-500 bg-white text-emerald-600 dark:bg-gray-900'
                              : 'border-gray-300 text-gray-400 dark:border-gray-600'
                          }`}
                        >
                          {scope.enabled ? <CheckCircle className="h-4 w-4" /> : '•'}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{scope.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{scope.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
                    <span>
                      {syncing ? 'Syncing live data' : syncProgress === 100 ? 'Last sync complete' : 'Ready to sync'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{syncProgress}%</span>
                  </div>
                  <div className="mt-3 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    ></div>
                  </div>
                  {syncing ? (
                    <p className="mt-3 flex items-center gap-2 text-xs text-emerald-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Streaming updates from Supabase & Stripe webhooks
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Select scopes then tap run sync to refresh data.
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Recent activity</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto overflow-x-hidden scroll-smooth rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
                    {syncLogs.map((log, index) => (
                      <div key={`${log.timestamp}-${index}`} className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</span>
                        <p className="flex-1 text-gray-800 dark:text-gray-200">{log.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {syncError && <p className="mt-4 text-sm text-red-500">{syncError}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last recorded sync: {syncLogs[0]?.timestamp ?? 'a few moments ago'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeSyncModal}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleStartSync}
                  className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 ${
                    syncing ? 'opacity-70' : ''
                  }`}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing…
                    </>
                  ) : (
                    'Run sync now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addUserOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={closeAddUserModal}
          role="presentation"
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeAddUserModal}
              className="absolute right-4 top-4 rounded-full border border-gray-200 p-1 text-gray-500 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white"
              aria-label="Close add user form"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Create</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add customer profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Capture the essentials so the ops team can start onboarding immediately.
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleAddUser}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Full name"
                  value={newCustomer.name}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, name: value }))}
                  placeholder="e.g. Jane Doe"
                  error={formErrors.name}
                />
                <InputField
                  label="Phone"
                  value={newCustomer.phone}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, phone: value }))}
                  placeholder="+1 555 123 4567"
                  error={formErrors.phone}
                />
                <InputField
                  label="Email address"
                  value={newCustomer.email}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, email: value }))}
                  placeholder="customer@domain.com"
                  type="email"
                  className="sm:col-span-2"
                  error={formErrors.email}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Account status"
                  value={newCustomer.status}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, status: value as CustomerStatus }))}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Banned', value: 'banned' },
                  ]}
                />
                <SelectField
                  label="KYC status"
                  value={newCustomer.kyc}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, kyc: value as KycStatus }))}
                  options={[
                    { label: 'Verified', value: 'verified' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Rejected', value: 'rejected' },
                  ]}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Orders to migrate"
                  value={newCustomer.orders.toString()}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, orders: Number(value) || 0 }))}
                  type="number"
                  min={0}
                />
                <InputField
                  label="Lifetime value ($)"
                  value={newCustomer.totalSpent.toString()}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, totalSpent: Number(value) || 0 }))}
                  type="number"
                  min={0}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Open tickets"
                  value={newCustomer.tickets.toString()}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, tickets: Number(value) || 0 }))}
                  type="number"
                  min={0}
                />
                <InputField
                  label="Last order date"
                  value={newCustomer.lastOrder}
                  onChange={(value) => setNewCustomer((prev) => ({ ...prev, lastOrder: value }))}
                  placeholder="Mar 18, 2024"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Internal notes</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  placeholder="Risk profile, region, funnel, etc."
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This profile will appear immediately in the customer grid once saved.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddUserOpen(false);
                      resetForm();
                    }}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40"
                  >
                    Save customer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  error,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  error?: string;
  min?: number;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:text-gray-200 ${
          error ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  helper: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const colors: Record<'neutral' | 'success' | 'warning' | 'danger', string> = {
    neutral: 'from-slate-600 to-slate-800',
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-emerald-500 via-teal-500 to-cyan-500',
    danger: 'from-red-500 to-rose-500',
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[tone]} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
    </div>
  );
}

function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger'; children: React.ReactNode }) {
  const colors: Record<'neutral' | 'success' | 'warning' | 'danger', string> = {
    neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[tone]}`}>{children}</span>;
}

function RoleCard({ title, members, description }: { title: string; members: number; description: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow dark:border-gray-800 dark:bg-gray-900">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{members} members</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      <div className="mt-3 flex gap-2">
        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
          Edit
        </button>
        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
          Duplicate
          </button>
      </div>
    </div>
  );
}

function statusTone(status: CustomerStatus): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'banned') return 'danger';
  return 'neutral';
}

