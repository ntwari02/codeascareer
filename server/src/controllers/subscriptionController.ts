import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getPlansFromDB, getPlanByTierId, SubscriptionPlans } from '../models/SubscriptionPlan';
import { SellerSubscription, ISellerSubscription } from '../models/SellerSubscription';
import { User } from '../models/User';
import {
  transformPlanToTier,
  transformInvoiceToFrontend,
  transformPaymentMethodToFrontend,
  transformCurrentPlanToFrontend,
  formatDate,
  calculateRenewalDate,
  calculateProratedAmount,
} from '../utils/subscriptionTransformers';
import {
  simulatePayment,
  simulateTokenizePaymentMethod,
  validateCardNumber,
  validateExpiryDate,
} from '../services/paymentSimulator';
import mongoose from 'mongoose';

/**
 * Helper function to get payment method icons from plans collection
 */
async function getPaymentMethodIcons() {
  try {
    const plansDoc = await SubscriptionPlans.findOne().lean();
    if (!plansDoc || !plansDoc.metadata) {
      return {
        visa: null,
        mtn: null,
        airtel: null,
      };
    }

    const icons = plansDoc.metadata.payment_method_icons || {};
    return {
      visa: icons.visa || null,
      mtn: icons.mtn || null,
      airtel: icons.airtel || null,
    };
  } catch (error) {
    console.error('Error fetching payment icons:', error);
    return {
      visa: null,
      mtn: null,
      airtel: null,
    };
  }
}

/**
 * GET /api/seller/subscription/plans
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(req: AuthenticatedRequest, res: Response) {
  try {
    const plans = await getPlansFromDB();

    // Sort by sort_order
    plans.sort((a, b) => a.sort_order - b.sort_order);

    // Get user's current subscription to mark current plan
    let currentTierId: string | undefined;
    if (req.user) {
      const subscription = await SellerSubscription.findOne({
        user_id: new mongoose.Types.ObjectId(req.user.id),
        is_active: true,
      }).lean();

      if (subscription) {
        currentTierId = subscription.current_plan.tier_id;
      }
    }

    const transformedPlans = plans.map((plan) => transformPlanToTier(plan, currentTierId));

    // Get payment method icons
    const paymentIcons = await getPaymentMethodIcons();

    res.json({ 
      plans: transformedPlans,
      paymentIcons,
    });
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
}

/**
 * GET /api/seller/subscription/current
 * Get current subscription details
 */
export async function getCurrentSubscription(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    }).lean();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const currentPlan = transformCurrentPlanToFrontend(subscription as ISellerSubscription);

    res.json({
      subscription: {
        ...currentPlan,
        status: subscription.current_plan.status,
        autoRenew: subscription.current_plan.auto_renew,
        startDate: formatDate(subscription.current_plan.start_date),
      },
    });
  } catch (error: any) {
    console.error('Error fetching current subscription:', error);
    res.status(500).json({ message: 'Failed to fetch current subscription' });
  }
}

/**
 * GET /api/seller/subscription/invoices
 * Get billing history (invoices) with optional filtering
 */
export async function getBillingHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    }).lean();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    let invoices = subscription.billing_history || [];

    // Apply filters if provided
    const { status, startDate, endDate, search } = req.query;
    
    if (status && typeof status === 'string') {
      invoices = invoices.filter((inv: any) => inv.status === status);
    }

    if (startDate && typeof startDate === 'string') {
      const start = new Date(startDate);
      invoices = invoices.filter((inv: any) => new Date(inv.date) >= start);
    }

    if (endDate && typeof endDate === 'string') {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      invoices = invoices.filter((inv: any) => new Date(inv.date) <= end);
    }

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      invoices = invoices.filter((inv: any) => 
        inv.invoice_number?.toLowerCase().includes(searchLower) ||
        inv.invoice_id?.toLowerCase().includes(searchLower) ||
        inv.plan_name?.toLowerCase().includes(searchLower) ||
        inv.transaction_id?.toLowerCase().includes(searchLower)
      );
    }

    // Transform and sort
    const transformedInvoices = invoices
      .map((invoice) => transformInvoiceToFrontend(invoice))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate summary statistics
    const totalAmount = transformedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCommission = transformedInvoices.reduce((sum, inv) => sum + inv.commission, 0);
    const totalFees = transformedInvoices.reduce((sum, inv) => sum + inv.processingFees + inv.otherFees, 0);
    const totalNetPayout = transformedInvoices.reduce((sum, inv) => sum + inv.netPayout, 0);

    res.json({ 
      invoices: transformedInvoices,
      summary: {
        totalInvoices: transformedInvoices.length,
        totalAmount,
        totalCommission,
        totalFees,
        totalNetPayout,
      }
    });
  } catch (error: any) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({ message: 'Failed to fetch billing history' });
  }
}

/**
 * GET /api/seller/subscription/invoices/:id/download
 * Download invoice as PDF (returns invoice URL or generates download link)
 */
export async function downloadInvoice(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    }).lean();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const invoice = subscription.billing_history.find(
      (inv: any) => inv.invoice_id === id || inv.invoice_number === id
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // If invoice has a URL, return it
    if (invoice.invoice_url) {
      return res.json({ 
        invoiceUrl: invoice.invoice_url,
        invoiceNumber: invoice.invoice_number || invoice.invoice_id,
      });
    }

    // Otherwise, return invoice data for frontend to generate/download
    const transformedInvoice = transformInvoiceToFrontend(invoice);
    res.json({ 
      invoice: transformedInvoice,
      invoiceNumber: invoice.invoice_number || invoice.invoice_id,
    });
  } catch (error: any) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ message: 'Failed to download invoice' });
  }
}

/**
 * GET /api/seller/subscription/payment-methods
 * Get saved payment methods
 */
export async function getPaymentMethods(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    }).lean();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const paymentMethods = subscription.payment_methods
      .filter((method) => method.is_active)
      .map((method) => transformPaymentMethodToFrontend(method));

    // Get payment method icons
    const paymentIcons = await getPaymentMethodIcons();

    res.json({ 
      paymentMethods,
      paymentIcons,
    });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Failed to fetch payment methods' });
  }
}

/**
 * POST /api/seller/subscription/payment-methods
 * Add a new payment method (Visa, MTN, or Airtel)
 */
export async function addPaymentMethod(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { type, cardNumber, expiryMonth, expiryYear, cvv, cardholderName, phoneNumber, accountName, provider } = req.body;

    // Determine payment method type
    const paymentType = type || (cardNumber ? 'visa' : (provider || 'mtn'));

    let newPaymentMethod: any;

    // Handle Visa/Card payment
    if (paymentType === 'visa' || paymentType === 'card') {
      // Validate input
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        return res.status(400).json({ message: 'All card fields are required' });
      }

      // Validate card number
      if (!validateCardNumber(cardNumber)) {
        return res.status(400).json({ message: 'Invalid card number' });
      }

      // Validate expiry date
      if (!validateExpiryDate(parseInt(expiryMonth), parseInt(expiryYear))) {
        return res.status(400).json({ message: 'Card has expired or invalid expiry date' });
      }

      // Simulate tokenization
      const tokenized = await simulateTokenizePaymentMethod({
        number: cardNumber,
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        cvv,
        cardholderName,
      });

      newPaymentMethod = {
        payment_method_id: tokenized.paymentMethodId,
        type: 'visa',
        brand: tokenized.brand || 'Visa',
        last4: tokenized.last4,
        expiry_month: parseInt(expiryMonth),
        expiry_year: parseInt(expiryYear),
        expiry_display: `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`,
        cardholder_name: cardholderName,
        is_default: true,
        is_active: true,
        gateway_payment_method_id: tokenized.paymentMethodId,
        gateway_type: 'stripe',
        created_at: new Date(),
        updated_at: new Date(),
      };
    } 
    // Handle MTN or Airtel Mobile Money
    else if (paymentType === 'mtn' || paymentType === 'airtel') {
      // Validate input
      if (!phoneNumber || !accountName) {
        return res.status(400).json({ message: 'Phone number and account name are required' });
      }

      // Validate phone number format (basic validation)
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (cleanedPhone.length < 9 || cleanedPhone.length > 12) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Generate payment method ID for mobile money
      const paymentMethodId = `mm_${paymentType}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      newPaymentMethod = {
        payment_method_id: paymentMethodId,
        type: paymentType,
        brand: paymentType.toUpperCase(),
        last4: cleanedPhone.slice(-4),
        phone_number: cleanedPhone,
        account_name: accountName,
        is_default: true,
        is_active: true,
        gateway_payment_method_id: paymentMethodId,
        gateway_type: paymentType === 'mtn' ? 'mtn_momo' : 'airtel_money',
        created_at: new Date(),
        updated_at: new Date(),
      };
    } else {
      return res.status(400).json({ message: 'Invalid payment method type. Supported: visa, mtn, airtel' });
    }

    // Find or create subscription
    let subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    });

    // If no subscription exists, create one (for free starter plan)
    if (!subscription) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get starter plan (free plan)
      const starterPlan = await getPlanByTierId('starter');
      if (!starterPlan) {
        return res.status(404).json({ message: 'Starter plan not found. Please contact support.' });
      }

      const now = new Date();
      const newRenewalDate = calculateRenewalDate(now, starterPlan.billing_cycle);

      subscription = new SellerSubscription({
        seller_id: new mongoose.Types.ObjectId(req.user.id),
        user_id: new mongoose.Types.ObjectId(req.user.id),
        store_name: user.fullName + "'s Store",
        identity_and_trust: {
          identity_status: 'pending',
          country: 'US',
          risk_level: 'medium',
          risk_score: 50,
          risk_factors: [],
          device_fingerprints: [],
          last_security_review: now,
          security_review_frequency_days: 90,
          next_security_review: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          kyc_status: 'pending',
          kyc_documents: [],
        },
        payment_gateway: {
          type: 'stripe',
          billing_portal_enabled: false,
          payout_destination: {
            type: 'bank_account',
            method: 'standard',
            currency: 'USD',
            country: 'US',
          },
          gateway_metadata: {},
        },
        current_plan: {
          plan_id: starterPlan.plan_id,
          tier_id: starterPlan.tier_id,
          tier_name: starterPlan.tier_name,
          name: starterPlan.name,
          price: starterPlan.price,
          currency: starterPlan.currency,
          billing_cycle: starterPlan.billing_cycle,
          status: 'active',
          start_date: now,
          renewal_date: newRenewalDate,
          auto_renew: true,
          trial_days: starterPlan.trial_days,
          trial_used: false,
          effective_price: starterPlan.price,
        },
        plan_features: {
          product_limit: starterPlan.limits.products.is_unlimited ? 'unlimited' : starterPlan.limits.products.display,
          product_limit_numeric: starterPlan.limits.products.limit,
          storage_limit: starterPlan.limits.storage.limit_display,
          storage_limit_bytes: starterPlan.limits.storage.limit_bytes,
          analytics_enabled: starterPlan.limits.analytics.enabled,
          priority_support: starterPlan.limits.support_level !== 'email',
          custom_branding: starterPlan.limits.custom_branding,
          api_access: starterPlan.limits.api_calls_per_month > 0,
          fast_payment_processing: true,
          white_label: starterPlan.limits.white_label,
          advanced_api: starterPlan.limits.api_calls_per_month > 10000,
          custom_integrations: false,
          dedicated_support: starterPlan.limits.support_level === 'dedicated_24_7',
        },
        financial_events: [],
        billing_history: [],
        payment_methods: [],
        payout_settings: {
          frequency: 'monthly',
          frequency_options: ['weekly', 'bi_weekly', 'monthly'],
          next_payout_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          payout_method: 'bank_transfer',
          payout_destination: {
            type: 'bank_account',
            country: 'US',
            currency: 'USD',
            is_verified: false,
          },
          minimum_payout_threshold: 50.0,
          currency: 'USD',
        },
        risk_and_defense: {
          failed_payments_count: 0,
          failed_payments_last_30_days: 0,
          failed_payments_history: [],
          disputed_transactions: [],
          dispute_count: 0,
          dispute_count_last_90_days: 0,
          location_mismatch_score: 0.0,
          location_mismatch_events: [],
          behavior_alerts: [],
          suspicious_activity_flags: [],
          fraud_score: 0,
          fraud_indicators: [],
          account_health_score: 100,
          account_health_status: 'excellent',
          last_risk_assessment: now,
          risk_assessment_frequency_days: 7,
        },
        subscription_history: [],
        audit_logs: [],
        statistics: {
          total_subscription_paid: 0,
          total_commissions_earned: 0,
          total_processing_fees: 0,
          total_other_fees: 0,
          total_net_payouts: 0,
          average_monthly_payout: 0,
          last_updated: now,
        },
        metadata: {
          created_at: now,
          updated_at: now,
          created_by: 'seller',
          last_modified_by: 'seller',
          version: 1,
          schema_version: '3.0',
        },
        status: 'active',
        is_active: true,
        trial: {
          is_trial: starterPlan.trial_enabled && starterPlan.trial_days > 0,
          trial_start_date: starterPlan.trial_enabled ? now : undefined,
          trial_end_date: starterPlan.trial_enabled ? new Date(now.getTime() + starterPlan.trial_days * 24 * 60 * 60 * 1000) : undefined,
          trial_days: starterPlan.trial_days,
        },
      });
    }

    // Set all other payment methods as non-default
    if (subscription.payment_methods && subscription.payment_methods.length > 0) {
      subscription.payment_methods.forEach((method: any) => {
        method.is_default = false;
      });
    }

    // Add new payment method
    subscription.payment_methods.push(newPaymentMethod as any);

    // Update payment gateway default
    subscription.payment_gateway.default_payment_method_id = newPaymentMethod.payment_method_id;

    // Add audit log
    subscription.audit_logs.push({
      log_id: `audit_${Date.now()}`,
      actor_id: req.user.id,
      actor_type: 'seller',
      action: 'payment_method_added',
      field: 'payment_methods',
      old_value: null,
      new_value: newPaymentMethod.payment_method_id,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      timestamp: new Date(),
      metadata: {
        payment_method_type: paymentType,
        brand: newPaymentMethod.brand,
      },
    } as any);

    await subscription.save();

    res.json({
      message: 'Payment method added successfully',
      paymentMethod: transformPaymentMethodToFrontend(newPaymentMethod),
    });
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ message: 'Failed to add payment method' });
  }
}

/**
 * DELETE /api/seller/subscription/payment-methods/:id
 * Delete a payment method
 */
export async function deletePaymentMethod(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const methodIndex = subscription.payment_methods.findIndex(
      (method) => method.payment_method_id === id
    );

    if (methodIndex === -1) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Don't allow deleting if it's the only payment method
    const activeMethods = subscription.payment_methods.filter((m) => m.is_active);
    if (activeMethods.length === 1) {
      return res.status(400).json({ message: 'Cannot delete the only payment method' });
    }

    // If it was default, set another one as default first
    if (subscription.payment_methods[methodIndex].is_default) {
      const otherActiveMethod = subscription.payment_methods.find(
        (m) => m.is_active && m.payment_method_id !== id
      );
      if (otherActiveMethod) {
        otherActiveMethod.is_default = true;
      }
    }

    // Actually remove the payment method from the array
    subscription.payment_methods.splice(methodIndex, 1);

    // Update payment gateway default if needed
    if (subscription.payment_gateway.default_payment_method_id === id) {
      const newDefault = subscription.payment_methods.find((m) => m.is_active);
      if (newDefault) {
        subscription.payment_gateway.default_payment_method_id = newDefault.payment_method_id;
      } else {
        subscription.payment_gateway.default_payment_method_id = undefined;
      }
    }

    await subscription.save();

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Failed to delete payment method' });
  }
}

/**
 * PATCH /api/seller/subscription/payment-methods/:id/default
 * Set payment method as default
 */
export async function setDefaultPaymentMethod(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Set all to non-default
    subscription.payment_methods.forEach((method) => {
      method.is_default = method.payment_method_id === id;
    });

    // Update payment gateway default
    subscription.payment_gateway.default_payment_method_id = id;

    await subscription.save();

    res.json({ message: 'Default payment method updated successfully' });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: 'Failed to set default payment method' });
  }
}

/**
 * POST /api/seller/subscription/upgrade
 * Upgrade or downgrade subscription plan
 */
export async function upgradeSubscription(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { tierId } = req.body;

    if (!tierId) {
      return res.status(400).json({ message: 'Tier ID is required' });
    }

    // Find the new plan
    const newPlan = await getPlanByTierId(tierId);

    if (!newPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Find current subscription
    let subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    });

    const now = new Date();
    let isNewSubscription = false;
    let paymentAmount = newPlan.price;
    let oldPlanId: string | null = null;
    let oldTierId: string | null = null;
    let oldPrice = 0;

    // If no subscription exists, create a new one
    if (!subscription) {
      // Get user info for store name
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if payment method is required (for paid plans)
      if (newPlan.price > 0) {
        // For paid plans, we need to check if they have a payment method
        // But since we don't have a subscription yet, we'll create one and they can add payment method
        // Or we can require payment method first - let's check if there's a way to store payment methods separately
        // For now, we'll create the subscription and require payment method to be added
      }

      // Create new subscription
      const newRenewalDate = calculateRenewalDate(now, newPlan.billing_cycle);
      
      subscription = new SellerSubscription({
        seller_id: new mongoose.Types.ObjectId(req.user.id),
        user_id: new mongoose.Types.ObjectId(req.user.id),
        store_name: user.fullName + "'s Store", // Use user's name as store name
        identity_and_trust: {
          identity_status: 'pending',
          country: 'US',
          risk_level: 'medium',
          risk_score: 50,
          risk_factors: [],
          device_fingerprints: [],
          last_security_review: now,
          security_review_frequency_days: 90,
          next_security_review: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          kyc_status: 'pending',
          kyc_documents: [],
        },
        payment_gateway: {
          type: 'stripe',
          billing_portal_enabled: false,
          payout_destination: {
            type: 'bank_account',
            method: 'standard',
            currency: 'USD',
            country: 'US',
          },
          gateway_metadata: {},
        },
        current_plan: {
          plan_id: newPlan.plan_id,
          tier_id: newPlan.tier_id,
          tier_name: newPlan.tier_name,
          name: newPlan.name,
          price: newPlan.price,
          currency: newPlan.currency,
          billing_cycle: newPlan.billing_cycle,
          status: 'active',
          start_date: now,
          renewal_date: newRenewalDate,
          auto_renew: true,
          trial_days: newPlan.trial_days,
          trial_used: false,
          effective_price: newPlan.price,
        },
        plan_features: {
          product_limit: newPlan.limits.products.is_unlimited ? 'unlimited' : newPlan.limits.products.display,
          product_limit_numeric: newPlan.limits.products.limit,
          storage_limit: newPlan.limits.storage.limit_display,
          storage_limit_bytes: newPlan.limits.storage.limit_bytes,
          analytics_enabled: newPlan.limits.analytics.enabled,
          priority_support: newPlan.limits.support_level !== 'email',
          custom_branding: newPlan.limits.custom_branding,
          api_access: newPlan.limits.api_calls_per_month > 0,
          fast_payment_processing: true,
          white_label: newPlan.limits.white_label,
          advanced_api: newPlan.limits.api_calls_per_month > 10000,
          custom_integrations: false,
          dedicated_support: newPlan.limits.support_level === 'dedicated_24_7',
        },
        financial_events: [],
        billing_history: [],
        payment_methods: [],
        payout_settings: {
          frequency: 'monthly',
          frequency_options: ['weekly', 'bi_weekly', 'monthly'],
          next_payout_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          payout_method: 'bank_transfer',
          payout_destination: {
            type: 'bank_account',
            country: 'US',
            currency: 'USD',
            is_verified: false,
          },
          minimum_payout_threshold: 50.0,
          currency: 'USD',
        },
        risk_and_defense: {
          failed_payments_count: 0,
          failed_payments_last_30_days: 0,
          failed_payments_history: [],
          disputed_transactions: [],
          dispute_count: 0,
          dispute_count_last_90_days: 0,
          location_mismatch_score: 0.0,
          location_mismatch_events: [],
          behavior_alerts: [],
          suspicious_activity_flags: [],
          fraud_score: 0,
          fraud_indicators: [],
          account_health_score: 100,
          account_health_status: 'excellent',
          last_risk_assessment: now,
          risk_assessment_frequency_days: 7,
        },
        subscription_history: [],
        audit_logs: [],
        statistics: {
          total_subscription_paid: 0,
          total_commissions_earned: 0,
          total_processing_fees: 0,
          total_other_fees: 0,
          total_net_payouts: 0,
          average_monthly_payout: 0,
          last_updated: now,
        },
        metadata: {
          created_at: now,
          updated_at: now,
          created_by: 'seller',
          last_modified_by: 'seller',
          version: 1,
          schema_version: '3.0',
        },
        status: 'active',
        is_active: true,
        trial: {
          is_trial: newPlan.trial_enabled && newPlan.trial_days > 0,
          trial_start_date: newPlan.trial_enabled ? now : undefined,
          trial_end_date: newPlan.trial_enabled ? new Date(now.getTime() + newPlan.trial_days * 24 * 60 * 60 * 1000) : undefined,
          trial_days: newPlan.trial_days,
        },
      });

      isNewSubscription = true;
    } else {
      // Check if already on this plan
      if (subscription.current_plan.tier_id === tierId) {
        return res.status(400).json({ message: 'You are already on this plan' });
      }

      oldPlanId = subscription.current_plan.plan_id;
      oldTierId = subscription.current_plan.tier_id;
      oldPrice = subscription.current_plan.price;

      // Calculate prorated amount for upgrade
      const startDate = new Date(subscription.current_plan.start_date);
      const renewalDate = new Date(subscription.current_plan.renewal_date);
      const daysRemaining = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const totalDaysInCycle = Math.ceil((renewalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      paymentAmount = Math.abs(calculateProratedAmount(oldPrice, newPlan.price, daysRemaining, totalDaysInCycle));
    }

    // Get default payment method (only required for paid plans)
    const defaultPaymentMethod = subscription.payment_methods?.find((m: any) => m.is_default && m.is_active);

    // If plan requires payment and no payment method exists
    if (newPlan.price > 0 && !defaultPaymentMethod) {
      return res.status(400).json({ 
        message: 'No default payment method found. Please add a payment method first.',
        requiresPaymentMethod: true 
      });
    }

    // Simulate payment (only if plan costs money)
    let paymentResult = null;
    if (newPlan.price > 0 && defaultPaymentMethod) {
      paymentResult = await simulatePayment({
        amount: paymentAmount,
        currency: 'USD',
        paymentMethodId: defaultPaymentMethod.payment_method_id,
        description: isNewSubscription 
          ? `New subscription: ${newPlan.tier_name}`
          : `Subscription upgrade from ${subscription.current_plan.tier_name} to ${newPlan.tier_name}`,
        metadata: {
          old_plan_id: oldPlanId,
          new_plan_id: newPlan.plan_id,
          prorated: !isNewSubscription,
        },
      });

      if (!paymentResult.success) {
        return res.status(402).json({
          message: 'Payment processing integration will be available soon. This is a simulation.',
          error: paymentResult.message,
        });
      }
    }

    // Update subscription
    const newRenewalDate = calculateRenewalDate(now, newPlan.billing_cycle);

    // Add to subscription history (only if upgrading, not creating new)
    if (!isNewSubscription && oldPlanId) {
      subscription.subscription_history.push({
        plan_id: oldPlanId,
        tier_id: oldTierId,
        tier_name: subscription.current_plan.tier_name,
        start_date: new Date(subscription.current_plan.start_date),
        end_date: now,
        price: oldPrice,
        billing_cycle: subscription.current_plan.billing_cycle,
        reason: 'upgraded',
        changed_at: now,
        changed_by: 'seller',
        change_ip: req.ip,
        change_user_agent: req.get('user-agent'),
      } as any);
    }

    // Update current plan
    subscription.current_plan = {
      plan_id: newPlan.plan_id,
      tier_id: newPlan.tier_id,
      tier_name: newPlan.tier_name,
      name: newPlan.name,
      price: newPlan.price,
      currency: newPlan.currency,
      billing_cycle: newPlan.billing_cycle,
      status: 'active',
      start_date: now,
      renewal_date: newRenewalDate,
      auto_renew: subscription.current_plan?.auto_renew ?? true,
      trial_days: newPlan.trial_days,
      trial_used: !newPlan.trial_enabled || subscription.trial?.trial_used || false,
      effective_price: newPlan.price,
    };

    // Update plan features
    subscription.plan_features = {
      product_limit: newPlan.limits.products.is_unlimited ? 'unlimited' : newPlan.limits.products.display,
      product_limit_numeric: newPlan.limits.products.limit,
      storage_limit: newPlan.limits.storage.limit_display,
      storage_limit_bytes: newPlan.limits.storage.limit_bytes,
      analytics_enabled: newPlan.limits.analytics.enabled,
      priority_support: newPlan.limits.support_level !== 'email',
      custom_branding: newPlan.limits.custom_branding,
      api_access: newPlan.limits.api_calls_per_month > 0,
      fast_payment_processing: true,
      white_label: newPlan.limits.white_label,
      advanced_api: newPlan.limits.api_calls_per_month > 10000,
      custom_integrations: false,
      dedicated_support: newPlan.limits.support_level === 'dedicated_24_7',
    };

    // Add financial event (only if payment was processed)
    if (paymentResult) {
      subscription.financial_events.push({
        event_id: `evt_${Date.now()}`,
        type: 'subscription',
        subtype: isNewSubscription ? 'payment' : 'upgrade',
        gateway_ref: paymentResult.gatewayRef,
        amount: paymentAmount,
        currency: 'USD',
        status: paymentResult.status,
        related_invoice: null,
        description: isNewSubscription 
          ? `New subscription: ${newPlan.tier_name}`
          : `Subscription upgrade from ${oldTierId} to ${newPlan.tier_name}`,
        processed_at: new Date(),
        created_at: new Date(),
      } as any);

      // Create test billing history invoice
      const invoiceDate = new Date();
      const invoiceYear = invoiceDate.getFullYear();
      const invoiceMonth = invoiceDate.toLocaleString('default', { month: 'short' });
      const invoiceSequence = (subscription.billing_history?.length || 0) + 1;
      const invoiceNumber = `INV-${invoiceYear}-${String(invoiceSequence).padStart(3, '0')}`;
      const invoiceId = `inv_${Date.now()}`;
      
      // Calculate commission and fees (simulated)
      const grossCommission = paymentAmount * 0.85; // 85% commission
      const processingFees = paymentAmount * 0.03; // 3% processing
      const otherFees = paymentAmount * 0.02; // 2% other fees
      const netPayout = grossCommission - processingFees - otherFees;

      const invoice = {
        invoice_id: invoiceId,
        invoice_number: invoiceNumber,
        date: invoiceDate,
        period: `${invoiceMonth} ${invoiceYear}`,
        period_type: newPlan.billing_cycle,
        plan_name: newPlan.tier_name,
        plan_id: newPlan.plan_id,
        subscription_amount: paymentAmount,
        currency: 'USD',
        status: 'paid',
        payment_method_id: defaultPaymentMethod?.payment_method_id || null,
        payment_date: invoiceDate,
        transaction_id: paymentResult.transactionId,
        gateway_ref: paymentResult.gatewayRef,
        breakdown: {
          gross_commission: grossCommission,
          processing_fees: processingFees,
          other_fees: otherFees,
          adjustments: 0.0,
          net_payout: netPayout,
        },
        payout: {
          scheduled_date: new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
          payout_method: 'bank_transfer',
          payout_status: 'pending',
          payout_reference: `PAY-${invoiceYear}-${String(invoiceSequence).padStart(3, '0')}`,
        },
        created_at: invoiceDate,
        updated_at: invoiceDate,
      };

      subscription.billing_history.push(invoice as any);
      
      // Update statistics
      subscription.statistics.total_subscription_paid += paymentAmount;
      subscription.statistics.total_commissions_earned += grossCommission;
      subscription.statistics.total_processing_fees += processingFees;
      subscription.statistics.total_other_fees += otherFees;
      subscription.statistics.total_net_payouts += netPayout;
      subscription.statistics.last_updated = new Date();
    }

    // Add audit log
    subscription.audit_logs.push({
      log_id: `audit_${Date.now()}`,
      actor_id: req.user.id,
      actor_type: 'seller',
      action: isNewSubscription ? 'subscription_created' : 'subscription_upgrade',
      field: 'current_plan.tier_id',
      old_value: oldTierId,
      new_value: newPlan.tier_id,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      timestamp: new Date(),
      metadata: {
        reason: isNewSubscription ? 'new_subscription' : 'upgrade',
        plan_id_old: oldPlanId,
        plan_id_new: newPlan.plan_id,
        amount: paymentAmount,
      },
    } as any);

    // Update metadata
    subscription.metadata.updated_at = now;
    subscription.metadata.last_modified_by = 'seller';
    subscription.metadata.version = (subscription.metadata.version || 0) + 1;

    await subscription.save();

    res.json({
      message: isNewSubscription ? 'Subscription created successfully' : 'Subscription upgraded successfully',
      subscription: transformCurrentPlanToFrontend(subscription),
      payment: paymentResult ? {
        transactionId: paymentResult.transactionId,
        amount: paymentAmount,
        status: paymentResult.status,
      } : null,
    });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ message: 'Failed to upgrade subscription' });
  }
}

/**
 * GET /api/seller/subscription/payout-schedule
 * Get payout schedule
 */
export async function getPayoutSchedule(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    }).lean();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json({
      frequency: subscription.payout_settings.frequency,
      nextPayoutDate: formatDate(subscription.payout_settings.next_payout_date),
      lastPayoutDate: subscription.payout_settings.last_payout_date
        ? formatDate(subscription.payout_settings.last_payout_date)
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching payout schedule:', error);
    res.status(500).json({ message: 'Failed to fetch payout schedule' });
  }
}

/**
 * PATCH /api/seller/subscription/payout-schedule
 * Update payout schedule frequency
 */
export async function updatePayoutSchedule(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { frequency } = req.body;

    if (!frequency || !['weekly', 'bi_weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ message: 'Valid frequency is required (weekly, bi_weekly, monthly)' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const oldFrequency = subscription.payout_settings.frequency;
    subscription.payout_settings.frequency = frequency;

    // Calculate next payout date based on frequency
    const now = new Date();
    const nextPayout = new Date(now);
    if (frequency === 'weekly') {
      nextPayout.setDate(nextPayout.getDate() + 7);
    } else if (frequency === 'bi_weekly') {
      nextPayout.setDate(nextPayout.getDate() + 14);
    } else if (frequency === 'monthly') {
      nextPayout.setMonth(nextPayout.getMonth() + 1);
    }
    subscription.payout_settings.next_payout_date = nextPayout;

    // Add audit log
    subscription.audit_logs.push({
      log_id: `audit_${Date.now()}`,
      actor_id: req.user.id,
      actor_type: 'seller',
      action: 'payout_schedule_updated',
      field: 'payout_settings.frequency',
      old_value: oldFrequency,
      new_value: frequency,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      timestamp: new Date(),
      metadata: {
        next_payout_date: nextPayout,
      },
    } as any);

    await subscription.save();

    res.json({
      message: 'Payout schedule updated successfully',
      frequency: subscription.payout_settings.frequency,
      nextPayoutDate: formatDate(subscription.payout_settings.next_payout_date),
      lastPayoutDate: subscription.payout_settings.last_payout_date
        ? formatDate(subscription.payout_settings.last_payout_date)
        : null,
    });
  } catch (error: any) {
    console.error('Error updating payout schedule:', error);
    res.status(500).json({ message: 'Failed to update payout schedule' });
  }
}

/**
 * GET /api/seller/subscription/b2b-requests
 * Get B2B payment requests (ACH and Wire Transfer)
 */
export async function getB2BPaymentRequests(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    }).lean();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const requests = subscription.b2b_payment_requests || [];

    res.json({ requests });
  } catch (error: any) {
    console.error('Error fetching B2B payment requests:', error);
    res.status(500).json({ message: 'Failed to fetch B2B payment requests' });
  }
}

/**
 * POST /api/seller/subscription/b2b-requests
 * Submit a B2B payment request (ACH or Wire Transfer)
 */
export async function submitB2BPaymentRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const {
      type, // 'ach' or 'wire'
      companyName,
      businessLegalName,
      taxId,
      taxIdType,
      contactName,
      contactEmail,
      contactPhone,
      annualContractValue,
      currency,
      country,
      bankName,
      accountType,
      routingNumber,
      accountNumber,
      swiftCode,
      iban,
      notes,
    } = req.body;

    if (!type || !['ach', 'wire'].includes(type)) {
      return res.status(400).json({ message: 'Invalid request type. Must be "ach" or "wire"' });
    }

    if (!companyName || !businessLegalName || !taxId || !contactName || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const subscription = await SellerSubscription.findOne({
      user_id: new mongoose.Types.ObjectId(req.user.id),
      is_active: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Check if there's already a pending or active request of this type
    const existingRequest = (subscription.b2b_payment_requests || []).find(
      (req: any) => req.type === type && (req.status === 'pending' || req.status === 'active')
    );

    if (existingRequest) {
      return res.status(400).json({
        message: `You already have a ${existingRequest.status} ${type.toUpperCase()} request. Please wait for review.`,
      });
    }

    const requestId = `b2b_${type}_${Date.now()}`;
    const now = new Date();

    const newRequest = {
      request_id: requestId,
      type,
      status: 'pending',
      company_name: companyName,
      business_legal_name: businessLegalName,
      tax_id: taxId,
      tax_id_type: taxIdType || 'EIN',
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      annual_contract_value: annualContractValue ? parseFloat(annualContractValue) : undefined,
      currency: currency || 'USD',
      country: country || 'US',
      bank_name: bankName,
      account_type: accountType,
      routing_number: routingNumber,
      account_number_masked: accountNumber ? `****${accountNumber.slice(-4)}` : undefined,
      swift_code: swiftCode,
      iban: iban,
      notes: notes,
      requested_at: now,
    };

    if (!subscription.b2b_payment_requests) {
      subscription.b2b_payment_requests = [];
    }

    subscription.b2b_payment_requests.push(newRequest as any);

    // Add audit log
    subscription.audit_logs.push({
      log_id: `audit_${Date.now()}`,
      actor_id: req.user.id,
      actor_type: 'seller',
      action: 'b2b_payment_request_submitted',
      field: 'b2b_payment_requests',
      old_value: null,
      new_value: requestId,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      timestamp: now,
      metadata: {
        request_type: type,
        company_name: companyName,
      },
    } as any);

    await subscription.save();

    res.json({
      message: `${type.toUpperCase()} payment request submitted successfully. Our team will review and contact you within 1-2 business days.`,
      request: {
        id: requestId,
        type,
        status: 'pending',
        requestedAt: now,
      },
    });
  } catch (error: any) {
    console.error('Error submitting B2B payment request:', error);
    res.status(500).json({ message: 'Failed to submit B2B payment request' });
  }
}

