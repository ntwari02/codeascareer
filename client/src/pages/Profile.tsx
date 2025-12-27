import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import { profileAPI } from '../lib/api';
import { useToastStore } from '../stores/toastStore';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle2,
  Edit,
  Save,
  Camera,
  ShoppingBag,
  Heart,
  Package,
  CreditCard,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Star,
  TrendingUp,
  Award,
  Clock,
  Mail as MailIcon,
  MessageSquare,
  Bell as BellIcon,
  Smartphone,
  Globe,
  Key,
  DollarSign,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'mobile';
  label: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme, currency, language, setCurrency, setLanguage } = useTheme();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'addresses' | 'payments' | 'notifications' | 'privacy'>('overview');
  const [showDeleteAddressConfirm, setShowDeleteAddressConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLanguageMenu && !target.closest('[data-language-menu]')) {
        setShowLanguageMenu(false);
      }
      if (showCurrencyMenu && !target.closest('[data-currency-menu]')) {
        setShowCurrencyMenu(false);
      }
    };
    
    if (showLanguageMenu || showCurrencyMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageMenu, showCurrencyMenu]);

  const languages = [
    { code: 'en', name: 'English US', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    { code: 'RWF', symbol: 'Fr', name: 'Rwandan Franc', rate: 1200 },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 130 },
  ];
  
  // Profile form state
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    location: '',
    website: '',
    dateOfBirth: '',
  });

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      label: 'Visa •••• 4242',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    }
  ]);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: {
      orders: true,
      promotions: true,
      newsletters: false,
      security: true,
    },
    push: {
      orders: true,
      promotions: false,
      messages: true,
    },
    sms: {
      orders: false,
      security: true,
    }
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showActivity: true,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Store the actual file for upload
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const hasLoadedProfile = useRef(false);
  const scrollPositionRef = useRef(0);

  // Helper to resolve avatar URL (handles both full URLs and relative paths)
  const resolveAvatarUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    // If it's a relative path, prepend the API host
    const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${API_HOST}${url}`;
  };

  // Save scroll position before any state changes
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after render
  useEffect(() => {
    if (scrollPositionRef.current > 0 && !loading) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [loading]);

  // Load profile data from backend
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Only load profile once on mount, not on every preference change
      if (hasLoadedProfile.current) {
        return;
      }

      try {
        setLoading(true);
        const response = await profileAPI.getProfile();
        const profileData = response.user;

        // Update form data
        setFormData({
          full_name: profileData.fullName || (user?.full_name || ''),
          email: profileData.email || (user?.email || ''),
          phone: profileData.phone || (user?.phone || ''),
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
        });

        const avatarUrl = profileData.avatarUrl || (user?.avatar_url || null);
        setAvatarPreview(avatarUrl ? resolveAvatarUrl(avatarUrl) : null);

        // Load addresses
        if (profileData.addresses && Array.isArray(profileData.addresses)) {
          setAddresses(profileData.addresses.map((addr: any, idx: number) => ({
            id: idx.toString(),
            label: addr.label || 'Address',
            fullName: user?.full_name || '',
            phone: user?.phone || '',
            address: addr.street || '',
            city: addr.city || '',
            country: addr.country || '',
            postalCode: addr.zipCode || '',
            isDefault: addr.isDefault || false,
          })));
        }

        // Load payment methods
        if (profileData.paymentMethods && Array.isArray(profileData.paymentMethods)) {
          setPaymentMethods(profileData.paymentMethods.map((pm: any, idx: number) => ({
            id: idx.toString(),
            type: pm.type === 'card' ? 'card' : pm.type === 'mobile_money' ? 'mobile' : 'card',
            label: pm.provider && pm.last4 ? `${pm.provider} •••• ${pm.last4}` : pm.type,
            last4: pm.last4,
            expiryMonth: pm.expiryMonth,
            expiryYear: pm.expiryYear,
            isDefault: pm.isDefault || false,
          })));
        }

        // Load notification settings
        if (profileData.notifications) {
          setNotifications({
            email: {
              orders: profileData.notifications.email?.orderUpdates ?? true,
              promotions: profileData.notifications.email?.promotions ?? true,
              newsletters: profileData.notifications.email?.newsletter ?? false,
              security: profileData.notifications.email?.securityAlerts ?? true,
            },
            push: {
              orders: profileData.notifications.push?.orderUpdates ?? true,
              promotions: profileData.notifications.push?.promotions ?? false,
              messages: profileData.notifications.push?.messages ?? true,
            },
            sms: {
              orders: profileData.notifications.sms?.orderUpdates ?? false,
              security: profileData.notifications.sms?.securityAlerts ?? true,
            },
          });
        }

        // Load privacy settings
        if (profileData.privacy) {
          setPrivacy({
            profileVisibility: profileData.privacy.profileVisibility || 'public',
            showEmail: profileData.privacy.showEmail || false,
            showPhone: profileData.privacy.showPhone || false,
            allowMessages: profileData.privacy.allowMessages ?? true,
            showActivity: profileData.privacy.showActivity ?? true,
          });
        }

        // Load preferences
        if (profileData.preferences) {
          if (profileData.preferences.theme) {
            // Update theme if different
            if (profileData.preferences.theme !== theme && profileData.preferences.theme !== 'auto') {
              // Note: This would need to be handled by the theme context
            }
          }
          if (profileData.preferences.language) {
            setLanguage(profileData.preferences.language as any);
          }
          if (profileData.preferences.currency) {
            setCurrency(profileData.preferences.currency as any);
          }
        }

        // Load security settings
        if (profileData.security) {
          setTwoFactorEnabled(profileData.security.twoFactorEnabled || false);
        }

      } catch (error: any) {
        console.error('Failed to load profile:', error);
        showToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
        hasLoadedProfile.current = true;
      }
    };

    loadProfile();
    // Only depend on user and navigate - remove setLanguage, setCurrency, theme, showToast
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let uploadedAvatarUrl: string | null = null;

      // If there's a new file to upload, upload it first
      if (avatarFile) {
        try {
          const uploadResponse = await profileAPI.uploadAvatar(avatarFile);
          uploadedAvatarUrl = uploadResponse.avatarUrl;
          setAvatarFile(null); // Clear the file after successful upload
          // Update preview with the uploaded URL
          setAvatarPreview(resolveAvatarUrl(uploadedAvatarUrl));
          
          // Immediately update user state with new avatar URL
          if (user) {
            const updatedUser = {
              ...user,
              avatar_url: uploadedAvatarUrl,
              updated_at: new Date().toISOString(),
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Trigger avatar update event immediately
            window.dispatchEvent(new CustomEvent('avatarUpdated', { 
              detail: { avatarUrl: uploadedAvatarUrl } 
            }));
          }
        } catch (uploadError: any) {
          console.error('Failed to upload avatar:', uploadError);
          showToast(uploadError.message || 'Failed to upload avatar', 'error');
          setIsSaving(false);
          return; // Stop here if avatar upload fails
        }
      }

      // Prepare update data (don't include avatarUrl here - it's already updated by upload endpoint)
      const updateData: any = {
        fullName: formData.full_name,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
      };

      if (formData.dateOfBirth) {
        updateData.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      }

      // Update profile with other fields
      const response = await profileAPI.updateProfile(updateData);
      
      // Update local user state
      if (user) {
        // Use uploaded avatar URL if available, otherwise use the response or existing preview
        const finalAvatarUrl = uploadedAvatarUrl || response.user.avatarUrl || (avatarPreview && !avatarPreview.startsWith('data:') ? avatarPreview : null);
        
        // Store the relative path in user state (not the resolved URL)
        // The Header component will resolve it when displaying
        const updatedUser = {
          ...user,
          full_name: response.user.fullName || formData.full_name,
          phone: response.user.phone || formData.phone,
          avatar_url: finalAvatarUrl, // Store the relative path from backend
          updated_at: new Date().toISOString(), // Update timestamp to force re-render
        };
        
        // Update Zustand store - this will trigger re-renders in all components using useAuthStore
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update avatar preview with resolved URL for display
        if (finalAvatarUrl) {
          setAvatarPreview(resolveAvatarUrl(finalAvatarUrl));
        }
        
        // Trigger avatar update event immediately (only if we didn't already trigger it during upload)
        if (!uploadedAvatarUrl) {
          window.dispatchEvent(new CustomEvent('avatarUpdated', { 
            detail: { avatarUrl: finalAvatarUrl } 
          }));
        }
      }

      showToast('Profile updated successfully', 'success');
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }

      // Store the file for later upload
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAddress = async () => {
    // For now, we'll show a simple prompt. In a real app, this would be a modal
    const label = prompt('Address label (e.g., Home, Work):') || 'Address';
    const street = prompt('Street address:') || '';
    const city = prompt('City:') || '';
    const zipCode = prompt('Zip/Postal code:') || '';
    const country = prompt('Country:') || 'Rwanda';

    if (!street || !city || !zipCode) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await profileAPI.addAddress({
        label,
        street,
        city,
        zipCode,
        country,
        isDefault: addresses.length === 0,
      });
      setAddresses(response.addresses.map((addr: any, idx: number) => ({
        id: idx.toString(),
        label: addr.label,
        fullName: user?.full_name || '',
        phone: user?.phone || '',
        address: addr.street,
        city: addr.city,
        country: addr.country,
        postalCode: addr.zipCode,
        isDefault: addr.isDefault,
      })));
      showToast('Address added successfully', 'success');
    } catch (error: any) {
      console.error('Failed to add address:', error);
      showToast(error.message || 'Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddressToDelete(id);
    setShowDeleteAddressConfirm(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    const index = parseInt(addressToDelete, 10);
    if (isNaN(index)) {
      setShowDeleteAddressConfirm(false);
      setAddressToDelete(null);
      return;
    }

    try {
      const response = await profileAPI.deleteAddress(index);
      setAddresses(response.addresses.map((addr: any, idx: number) => ({
        id: idx.toString(),
        label: addr.label,
        fullName: user?.full_name || '',
        phone: user?.phone || '',
        address: addr.street,
        city: addr.city,
        country: addr.country,
        postalCode: addr.zipCode,
        isDefault: addr.isDefault,
      })));
      showToast('Address deleted successfully', 'success');
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      showToast(error.message || 'Failed to delete address', 'error');
    } finally {
      setShowDeleteAddressConfirm(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const index = parseInt(id, 10);
    if (isNaN(index)) return;

    const address = addresses[index];
    if (!address) return;

    try {
      const response = await profileAPI.updateAddress(index, {
        label: address.label,
        street: address.address,
        city: address.city,
        zipCode: address.postalCode,
        country: address.country,
        isDefault: true,
      });
      setAddresses(response.addresses.map((addr: any, idx: number) => ({
        id: idx.toString(),
        label: addr.label,
        fullName: user?.full_name || '',
        phone: user?.phone || '',
        address: addr.street,
        city: addr.city,
        country: addr.country,
        postalCode: addr.zipCode,
        isDefault: addr.isDefault,
      })));
      showToast('Default address updated', 'success');
    } catch (error: any) {
      console.error('Failed to update address:', error);
      showToast(error.message || 'Failed to update address', 'error');
    }
  };

  const handleAddPaymentMethod = () => {
    // In a real app, this would open a payment method form/modal
    alert('Payment method addition would be handled by a payment provider integration');
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (!currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await profileAPI.changePassword({
        currentPassword,
        newPassword,
      });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string; width: string } => {
    if (!password) return { strength: 'weak', color: 'bg-gray-300', width: '0%' };
    if (password.length < 6) return { strength: 'weak', color: 'bg-red-500', width: '33%' };
    if (password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'medium', color: 'bg-yellow-500', width: '66%' };
    }
    return { strength: 'strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Handle notification settings update
  const handleNotificationChange = async (type: 'email' | 'push' | 'sms', key: string, value: boolean) => {
    const updated = {
      ...notifications,
      [type]: { ...notifications[type], [key]: value },
    };
    setNotifications(updated);

    try {
      await profileAPI.updateNotificationSettings({
        [type]: { [key]: value },
      });
    } catch (error: any) {
      console.error('Failed to update notification settings:', error);
      showToast(error.message || 'Failed to update notification settings', 'error');
      // Revert on error
      setNotifications(notifications);
    }
  };

  // Handle privacy settings update
  const handlePrivacyChange = async (key: string, value: any) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);

    try {
      await profileAPI.updatePrivacySettings({ [key]: value });
      showToast('Privacy settings updated', 'success');
    } catch (error: any) {
      console.error('Failed to update privacy settings:', error);
      showToast(error.message || 'Failed to update privacy settings', 'error');
      // Revert on error
      setPrivacy(privacy);
    }
  };

  // Handle preferences update
  const handlePreferenceChange = async (key: 'theme' | 'language' | 'currency', value: any) => {
    // Save current scroll position
    const currentScroll = window.scrollY;
    
    try {
      // Update local state first for immediate UI feedback
      if (key === 'language') {
        setLanguage(value);
      } else if (key === 'currency') {
        setCurrency(value);
      }
      
      // Update backend (fire and forget - don't wait to restore scroll)
      profileAPI.updatePreferences({ [key]: value }).catch((error: any) => {
        console.error('Failed to update preferences:', error);
        showToast(error.message || 'Failed to update preferences', 'error');
        // Revert on error
        if (key === 'language') {
          setLanguage(language);
        } else if (key === 'currency') {
          setCurrency(currency);
        }
      });
      
      showToast('Preferences updated', 'success');
      
      // Restore scroll position immediately after state update
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScroll);
      });
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      showToast(error.message || 'Failed to update preferences', 'error');
      // Restore scroll on error too
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScroll);
      });
    }
  };

  // Handle security settings update
  const handleSecurityChange = async (enabled: boolean, method?: 'email' | 'sms' | 'app' | null) => {
    try {
      await profileAPI.updateSecuritySettings({
        twoFactorEnabled: enabled,
        twoFactorMethod: enabled ? (method || 'email') : null,
      });
      setTwoFactorEnabled(enabled);
      showToast(enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled', 'success');
    } catch (error: any) {
      console.error('Failed to update security settings:', error);
      showToast(error.message || 'Failed to update security settings', 'error');
    }
  };

  // Mock statistics
  const stats = {
    totalOrders: 12,
    totalSpent: 2450.99,
    wishlistItems: wishlistItems.length,
    cartItems: cartItems.length,
    reviews: 8,
    averageRating: 4.7,
  };

  const recentActivity = [
    { id: 'a1', title: 'Order #12345 delivered', detail: 'Nike Air Max 270 • RWF 180,000', time: '2h ago' },
    { id: 'a2', title: 'Wishlist updated', detail: 'Added 2 items to Wishlist', time: '1d ago' },
    { id: 'a3', title: 'Payment method added', detail: 'Visa •••• 4242', time: '3d ago' },
    { id: 'a4', title: 'Security', detail: 'Two-factor authentication enabled', time: '5d ago' },
  ];

  const loyalty = {
    tier: 'Gold',
    points: 3280,
    nextTier: 'Platinum',
    progress: 72,
    perks: ['Priority support', 'Early access', 'Free returns'],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0c10]">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-10 py-5 sm:py-8 lg:py-10">
        {/* Profile Header */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-2xl">
                    {avatarPreview ? (
                      <img src={resolveAvatarUrl(avatarPreview) || ''} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                          {user.full_name || 'User'}
                        </h1>
                        <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 text-xs font-semibold uppercase tracking-wide">Loyalty {loyalty.tier}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {formData.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4" />
                            <span>{formData.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Button onClick={() => setShowEditModal(true)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>

                  {/* Loyalty strip */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{loyalty.points} pts</span>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progress to {loyalty.nextTier}</span>
                        <span>{loyalty.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/90" style={{ width: `${loyalty.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {loyalty.perks.slice(0, 3).map((perk) => (
                        <span key={perk} className="px-2 py-1 rounded-full bg-white/15 border border-white/20">{perk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-3 overflow-x-auto backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-800/80">
            <nav className="flex items-center gap-1 sm:gap-2 min-w-max">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'addresses', label: 'Addresses', icon: MapPin },
                { id: 'payments', label: 'Payment Methods', icon: CreditCard },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'privacy', label: 'Privacy', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: 'Total Orders', value: stats.totalOrders, icon: Package, accent: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10', text: 'text-blue-600 dark:text-blue-300' },
                    { label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: TrendingUp, accent: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10', text: 'text-green-600 dark:text-green-300' },
                    { label: 'Wishlist Items', value: stats.wishlistItems, icon: Heart, accent: 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10', text: 'text-red-600 dark:text-red-300' },
                    { label: 'Avg Rating', value: stats.averageRating, icon: Star, accent: 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/10', text: 'text-orange-600 dark:text-orange-300' },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700/60">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${card.accent}`}>
                            <Icon className={`h-5 w-5 ${card.text}`} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{card.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">Fast links</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Link
                      to="/orders"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-800/40"
                    >
                      <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-800/40"
                    >
                      <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Wishlist</span>
                    </Link>
                    <Link
                      to="/cart"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-800/40"
                    >
                      <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Shopping Cart</span>
                      {cartItems.length > 0 && (
                        <span className="bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItems.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/messages"
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Messages</span>
                    </Link>
                  </div>
                </div>

                {/* Account Status + Activity */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700/60">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Account Status</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Email Verified</span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Verified</span>
                      </div>
                      {user.role === 'buyer' && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Account Type</span>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{user.role}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700/60">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                      {recentActivity.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/60 hover:border-orange-200 dark:hover:border-orange-700/60 transition-colors">
                          <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/30">
                            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{item.detail}</p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700/60">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Loyalty</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Gold • {loyalty.points} pts</p>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: `${loyalty.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <span>Progress to {loyalty.nextTier}</span>
                      <span>{loyalty.progress}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {loyalty.perks.map((perk) => (
                        <span key={perk} className="px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                
                {/* Change Password */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Password strength</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.strength === 'strong' ? 'text-green-600 dark:text-green-400' :
                              passwordStrength.strength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: passwordStrength.width }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:scale-100 disabled:hover:bg-gradient-to-r disabled:hover:from-orange-500 disabled:hover:via-orange-600 disabled:hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => handleSecurityChange(!twoFactorEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        twoFactorEnabled ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Windows • Chrome • Kigali, Rwanda</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>

                {/* Language Settings */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Language</h3>
                  <div className="relative" data-language-menu>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowLanguageMenu(!showLanguageMenu);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {languages.find(l => l.code === language)?.name || 'English US'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {languages.find(l => l.code === language)?.flag || '🇺🇸'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showLanguageMenu && (
                      <div 
                        className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handlePreferenceChange('language', lang.code);
                              setShowLanguageMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              language === lang.code 
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="flex-1 text-left font-medium">{lang.name}</span>
                            {language === lang.code && (
                              <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Currency Settings */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Currency</h3>
                  <div className="relative" data-currency-menu>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCurrencyMenu(!showCurrencyMenu);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {currencies.find(c => c.code === currency)?.symbol || '$'} {currencies.find(c => c.code === currency)?.name || 'US Dollar'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showCurrencyMenu && (
                      <div 
                        className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currencies.map((curr) => (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handlePreferenceChange('currency', curr.code);
                              setShowCurrencyMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              currency === curr.code 
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            <span className="font-semibold text-lg">{curr.symbol}</span>
                            <span className="flex-1 text-left font-medium">{curr.name}</span>
                            {currency === curr.code && (
                              <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Appearance Settings */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      const currentScroll = window.scrollY;
                      toggleTheme(); // ThemeContext will save to DB automatically
                      // Restore scroll after theme change
                      requestAnimationFrame(() => {
                        window.scrollTo(0, currentScroll);
                      });
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </div>
                    <div className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                      theme === 'dark' ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 top-0.5 ${
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                  <Button onClick={handleAddAddress} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Address
                  </Button>
                </div>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{address.label}</span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-medium rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{address.fullName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{address.address}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.city}, {address.country} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{address.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payments' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
                  <Button onClick={handleAddPaymentMethod} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{method.label}</p>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                          {method.isDefault && (
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Default</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                
                {/* Email Notifications */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <MailIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <button
                          onClick={() => handleNotificationChange('email', key, !value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <button
                          onClick={() => handleNotificationChange('push', key, !value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Email Address</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow others to see your email</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange('showEmail', !privacy.showEmail)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.showEmail ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Phone Number</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow others to see your phone</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange('showPhone', !privacy.showPhone)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.showPhone ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy.showPhone ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Messages</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Let others send you messages</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange('allowMessages', !privacy.allowMessages)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.allowMessages ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy.allowMessages ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Activity</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Display your recent activity</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange('showActivity', !privacy.showActivity)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacy.showActivity ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
      </main>

      {/* Edit Profile Modal (outside main for clean layout) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information, contact details and profile photo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {avatarPreview ? (
                  <img src={resolveAvatarUrl(avatarPreview) || ''} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Camera className="h-4 w-4" />
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+250 788 000 000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/70 text-gray-900 dark:text-gray-300 text-sm focus:outline-none cursor-not-allowed"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email changes are managed through account security.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Tell buyers a bit about yourself…"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                // Reset form data on cancel
                setFormData({
                  full_name: user.full_name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  bio: '',
                  location: '',
                  website: '',
                  dateOfBirth: '',
                });
                setAvatarPreview(user.avatar_url || null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAddressConfirm}
        onClose={() => {
          setShowDeleteAddressConfirm(false);
          setAddressToDelete(null);
        }}
        onConfirm={confirmDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <Footer />
    </div>
  );
}


