const API_BASE = 'http://localhost:5000/api/seller/subscription';

/**
 * Get authentication headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Subscription API Service
 */
export const subscriptionApi = {
  /**
   * Get all available subscription plans
   */
  async getPlans() {
    const response = await fetch(`${API_BASE}/plans`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch subscription plans');
    }

    return response.json();
  },

  /**
   * Get current subscription details
   */
  async getCurrentSubscription() {
    const response = await fetch(`${API_BASE}/current`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch current subscription');
    }

    return response.json();
  },

  /**
   * Get billing history (invoices) with optional filters
   */
  async getBillingHistory(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE}/invoices${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch billing history');
    }

    return response.json();
  },

  /**
   * Download invoice
   */
  async downloadInvoice(invoiceId: string) {
    const response = await fetch(`${API_BASE}/invoices/${invoiceId}/download`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download invoice');
    }

    return response.json();
  },

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    const response = await fetch(`${API_BASE}/payment-methods`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payment methods');
    }

    return response.json();
  },

  /**
   * Add a new payment method
   */
  async addPaymentMethod(data: {
    type?: 'visa' | 'mtn' | 'airtel';
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    cardholderName?: string;
    phoneNumber?: string;
    accountName?: string;
    provider?: 'mtn' | 'airtel';
  }) {
    const response = await fetch(`${API_BASE}/payment-methods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add payment method');
    }

    return response.json();
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string) {
    const response = await fetch(`${API_BASE}/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete payment method');
    }

    return response.json();
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string) {
    const response = await fetch(`${API_BASE}/payment-methods/${paymentMethodId}/default`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set default payment method');
    }

    return response.json();
  },

  /**
   * Upgrade subscription plan
   */
  async upgradeSubscription(tierId: string) {
    const response = await fetch(`${API_BASE}/upgrade`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ tierId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upgrade subscription');
    }

    return response.json();
  },

  /**
   * Get payout schedule
   */
  async getPayoutSchedule() {
    const response = await fetch(`${API_BASE}/payout-schedule`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payout schedule');
    }

    return response.json();
  },

  /**
   * Update payout schedule
   */
  async updatePayoutSchedule(frequency: 'weekly' | 'bi_weekly' | 'monthly') {
    const response = await fetch(`${API_BASE}/payout-schedule`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ frequency }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payout schedule');
    }

    return response.json();
  },

  /**
   * Get B2B payment requests
   */
  async getB2BPaymentRequests() {
    const response = await fetch(`${API_BASE}/b2b-requests`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch B2B payment requests');
    }

    return response.json();
  },

  /**
   * Submit B2B payment request
   */
  async submitB2BPaymentRequest(data: {
    type: 'ach' | 'wire';
    companyName: string;
    businessLegalName: string;
    taxId: string;
    taxIdType?: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    annualContractValue?: number;
    currency?: string;
    country?: string;
    bankName?: string;
    accountType?: string;
    routingNumber?: string;
    accountNumber?: string;
    swiftCode?: string;
    iban?: string;
    notes?: string;
  }) {
    const response = await fetch(`${API_BASE}/b2b-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit B2B payment request');
    }

    return response.json();
  },
};

