import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Edit, Lock, Shield, Bell, FileText, Building2, Clock, CreditCard, Landmark, Smartphone, Upload, X, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'payout' | 'notifications' | 'policies'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);

  const [profile, setProfile] = useState({
    storeName: 'Seller Co.',
    storeLogo: '',
    sellerBio: 'Experienced seller with 5+ years in e-commerce',
    name: 'John Seller',
    email: 'john.seller@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345',
    workingHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
    storeBanner: '',
  });

  const [security] = useState({
    twoFactorEnabled: false,
    loginHistory: [
      { date: '2024-01-15 10:30 AM', ip: '192.168.1.1', location: 'New York, USA', device: 'Chrome on Windows' },
      { date: '2024-01-14 02:15 PM', ip: '192.168.1.1', location: 'New York, USA', device: 'Chrome on Windows' },
      { date: '2024-01-13 09:00 AM', ip: '192.168.1.2', location: 'New York, USA', device: 'Safari on iPhone' },
    ],
  });

  const [payoutSettings] = useState({
    bankAccounts: [
      { id: '1', bankName: 'Chase Bank', accountNumber: '****1234', routingNumber: '****5678', isDefault: true },
    ],
    mobileMoney: null,
  });

  const [notifications] = useState({
    email: {
      newOrders: true,
      newMessages: true,
      newReviews: true,
      newDisputes: true,
      lowStock: true,
      paymentReceived: true,
    },
    sms: {
      newOrders: false,
      newDisputes: true,
      paymentReceived: false,
    },
    push: {
      enabled: true,
      newOrders: true,
      newMessages: true,
    },
  });

  const [policies, setPolicies] = useState({
    shippingPolicy: 'We offer free shipping on orders over $50. Standard shipping takes 5-7 business days.',
    returnPolicy: 'Items can be returned within 30 days of purchase. Items must be in original condition.',
    refundPolicy: 'Refunds will be processed within 5-7 business days after receiving the returned item.',
    storeTerms: 'By purchasing from our store, you agree to our terms and conditions.',
  });

  const [savingPolicy, setSavingPolicy] = useState<string | null>(null);
  const [savedPolicy, setSavedPolicy] = useState<string | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleSavePolicy = async (policyKey: string) => {
    setSavingPolicy(policyKey);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setSavingPolicy(null);
    setSavedPolicy(policyKey);
    setTimeout(() => setSavedPolicy(null), 3000);
    // Here you would typically save to your backend
    console.log(`Saving ${policyKey}:`, policies[policyKey as keyof typeof policies]);
  };

  const handlePolicyChange = (policyKey: string, value: string) => {
    setPolicies(prev => ({
      ...prev,
      [policyKey]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <User className="w-8 h-8 text-red-400" />
            Profile & Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/30 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'payout', label: 'Payout Settings', icon: CreditCard },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'policies', label: 'Policy Pages', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium transition-colors duration-300 border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-500 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-red-400" />
                  Store Information
                </h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">Store Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.storeName}
                      onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white transition-colors duration-300">{profile.storeName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">Store Logo</label>
                  <div className="flex items-center gap-4">
                    {profile.storeLogo ? (
                      <img src={profile.storeLogo} alt="Store logo" className="w-20 h-20 rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {isEditing && (
                      <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">Store Banner</label>
                  <div className="flex items-center gap-4">
                    {profile.storeBanner ? (
                      <img src={profile.storeBanner} alt="Store banner" className="w-full h-32 rounded-lg object-cover" />
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {isEditing && (
                      <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Banner
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">Seller Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profile.sellerBio}
                      onChange={(e) => setProfile({ ...profile, sellerBio: e.target.value })}
                      rows={4}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white transition-colors duration-300">{profile.sellerBio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2 transition-colors duration-300">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white transition-colors duration-300">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2 transition-colors duration-300">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white transition-colors duration-300">{profile.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2 transition-colors duration-300">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white transition-colors duration-300">{profile.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2 transition-colors duration-300">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white transition-colors duration-300">{profile.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300 flex items-center gap-2">
                <Clock className="w-6 h-6 text-red-400" />
                Working Hours
              </h2>
              <div className="space-y-3">
                {Object.entries(profile.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize transition-colors duration-300">{day}</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={hours}
                        onChange={(e) => setProfile({
                          ...profile,
                          workingHours: { ...profile.workingHours, [day]: e.target.value }
                        })}
                        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{hours}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Account Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Subscription</p>
                  <p className="text-gray-900 dark:text-white font-semibold transition-colors duration-300">Premium Tier</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Member Since</p>
                  <p className="text-gray-900 dark:text-white font-semibold transition-colors duration-300">Jan 2024</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Total Sales</p>
                  <p className="text-green-500 dark:text-green-400 font-semibold transition-colors duration-300">$125,430</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-400" />
              Change Password
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Update Password
              </Button>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-400" />
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  security.twoFactorEnabled 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Button 
                  variant="outline"
                  onClick={() => setShow2FAModal(true)}
                  className="border-gray-300 dark:border-gray-700"
                >
                  {security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Login History</h2>
            <div className="space-y-3">
              {security.loginHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{entry.date}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{entry.device} • {entry.location}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">{entry.ip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payout Settings Tab */}
      {activeTab === 'payout' && (
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-2">
                <Landmark className="w-6 h-6 text-red-400" />
                Bank Account Details
              </h2>
              <Button 
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={() => setShowAddBank(true)}
              >
                Add Bank Account
              </Button>
            </div>
            <div className="space-y-3">
              {payoutSettings.bankAccounts.map((account, index) => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center gap-4">
                    <Landmark className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{account.bankName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        Account: {account.accountNumber} • Routing: {account.routingNumber}
                      </p>
                    </div>
                    {account.isDefault && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 dark:text-red-400">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-red-400" />
              Mobile Money Payout
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300">
                Configure your mobile money account for payouts
              </p>
              <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                Configure Mobile Money
              </Button>
            </div>
          </div>

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

      {/* Notifications Settings Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <Mail className="w-6 h-6 text-red-400" />
              Email Notifications
            </h2>
            <div className="space-y-3">
              {Object.entries(notifications.email).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white capitalize transition-colors duration-300">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    className="rounded border-gray-300 dark:border-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-red-400" />
              SMS Alerts
            </h2>
            <div className="space-y-3">
              {Object.entries(notifications.sms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white capitalize transition-colors duration-300">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    className="rounded border-gray-300 dark:border-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-400" />
              Push Notifications
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">Enable Push Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.push.enabled}
                  className="rounded border-gray-300 dark:border-gray-700"
                />
              </div>
              {notifications.push.enabled && (
                <>
                  {Object.entries(notifications.push).filter(([key]) => key !== 'enabled').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg ml-4">
                      <span className="text-sm text-gray-900 dark:text-white capitalize transition-colors duration-300">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Policy Pages Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Note:</strong> These policy pages will be visible to your customers. Make sure to keep them up-to-date and compliant with your business practices.
            </p>
          </div>

          {[
            { key: 'shippingPolicy', label: 'Shipping Policy', icon: Package, description: 'Define your shipping methods, costs, and delivery times.' },
            { key: 'returnPolicy', label: 'Return & Refund Policy', icon: FileText, description: 'Specify return conditions, timeframes, and procedures.' },
            { key: 'refundPolicy', label: 'Refund Policy', icon: CreditCard, description: 'Detail your refund process, timelines, and conditions.' },
            { key: 'storeTerms', label: 'Store Terms & Conditions', icon: FileText, description: 'Set the terms and conditions for using your store.' },
          ].map(({ key, label, icon: Icon, description }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 flex items-center gap-2">
                  <Icon className="w-6 h-6 text-red-400" />
                  {label}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{description}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Policy Content
                </label>
                <textarea
                  value={policies[key as keyof typeof policies]}
                  onChange={(e) => handlePolicyChange(key, e.target.value)}
                  rows={10}
                  placeholder={`Enter your ${label.toLowerCase()}...`}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 resize-y"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors duration-300">
                  {policies[key as keyof typeof policies].length} characters
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {savedPolicy === key && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-green-600 dark:text-green-400"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Saved successfully!</span>
                    </motion.div>
                  )}
                </div>
                <Button
                  onClick={() => handleSavePolicy(key)}
                  disabled={savingPolicy === key}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPolicy === key ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save {label}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Preview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
              Your policy pages will be accessible to customers at:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">Shipping Policy</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">/store/shipping-policy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">Return & Refund Policy</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">/store/return-policy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">Refund Policy</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">/store/refund-policy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white transition-colors duration-300">Terms & Conditions</span>
                <span className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">/store/terms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scan this QR code with your authenticator app to enable 2FA.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 mx-auto rounded"></div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShow2FAModal(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Enable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Bank Modal */}
      <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Name</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Routing Number</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddBank(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Add Bank Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
