/**
 * API Configuration and Service
 * Centralized API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authentication headers with token
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Profile API Service
 */
export const profileAPI = {
  /**
   * Get current user's profile
   */
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ user: any }>(response);
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(`${API_BASE_URL}/profile/me/avatar`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    return handleResponse<{ message: string; avatarUrl: string; user: any }>(response);
  },

  /**
   * Get public profile by user ID
   */
  async getPublicProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/profile/public/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ user: any }>(response);
  },

  /**
   * Update profile
   */
  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    dateOfBirth?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; user: any }>(response);
  },

  /**
   * Add address
   */
  async addAddress(address: {
    label: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(address),
    });
    return handleResponse<{ message: string; addresses: any[] }>(response);
  },

  /**
   * Update address by index
   */
  async updateAddress(index: number, address: {
    label: string;
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/addresses/${index}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(address),
    });
    return handleResponse<{ message: string; addresses: any[] }>(response);
  },

  /**
   * Delete address by index
   */
  async deleteAddress(index: number) {
    const response = await fetch(`${API_BASE_URL}/profile/me/addresses/${index}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string; addresses: any[] }>(response);
  },

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentMethod: {
    type: 'card' | 'bank' | 'mobile_money' | 'crypto';
    provider?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault?: boolean;
    billingAddress?: any;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/payment-methods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(paymentMethod),
    });
    return handleResponse<{ message: string; paymentMethods: any[] }>(response);
  },

  /**
   * Update payment method by index
   */
  async updatePaymentMethod(index: number, paymentMethod: {
    type: 'card' | 'bank' | 'mobile_money' | 'crypto';
    provider?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault?: boolean;
    billingAddress?: any;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/payment-methods/${index}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(paymentMethod),
    });
    return handleResponse<{ message: string; paymentMethods: any[] }>(response);
  },

  /**
   * Delete payment method by index
   */
  async deletePaymentMethod(index: number) {
    const response = await fetch(`${API_BASE_URL}/profile/me/payment-methods/${index}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string; paymentMethods: any[] }>(response);
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    email?: {
      orderUpdates?: boolean;
      promotions?: boolean;
      securityAlerts?: boolean;
      newsletter?: boolean;
    };
    push?: {
      orderUpdates?: boolean;
      promotions?: boolean;
      messages?: boolean;
      securityAlerts?: boolean;
    };
    sms?: {
      orderUpdates?: boolean;
      securityAlerts?: boolean;
      promotions?: boolean;
    };
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/notifications`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return handleResponse<{ message: string; notifications: any }>(response);
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showPhone?: boolean;
    allowMessages?: boolean;
    showActivity?: boolean;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/privacy`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return handleResponse<{ message: string; privacy: any }>(response);
  },

  /**
   * Update preferences
   */
  async updatePreferences(preferences: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    currency?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/preferences`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(preferences),
    });
    return handleResponse<{ message: string; preferences: any }>(response);
  },

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(response);
  },

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: {
    twoFactorEnabled?: boolean;
    twoFactorMethod?: 'email' | 'sms' | 'app' | null;
  }) {
    const response = await fetch(`${API_BASE_URL}/profile/me/security`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return handleResponse<{ message: string; security: any }>(response);
  },
};

/**
 * Auth API Service
 */
export const authAPI = {
  /**
   * Register new user
   */
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    role?: 'buyer' | 'seller' | 'admin';
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: any; token: string }>(response);
  },

  /**
   * Login user
   */
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ user: any; token: string }>(response);
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ user: any }>(response);
  },
};

