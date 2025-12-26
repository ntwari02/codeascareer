# Subscription API Documentation

## Base URL
All subscription endpoints are prefixed with: `/api/seller/subscription`

## Authentication
All endpoints require authentication via JWT token in:
- Header: `Authorization: Bearer <token>`
- Or Cookie: `token=<token>`

All endpoints (except `/plans`) require `seller` role.

---

## Endpoints

### 1. Get Available Plans
**GET** `/api/seller/subscription/plans`

Get all available subscription plans. Public endpoint (requires authentication but not seller role).

**Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price": 0,
      "features": ["Up to 50 products", "Basic analytics", ...],
      "limits": {
        "products": "50 products",
        "storage": "5GB",
        "analytics": false
      },
      "current": false,
      "popular": false
    }
  ]
}
```

---

### 2. Get Current Subscription
**GET** `/api/seller/subscription/current`

Get current subscription details for the authenticated seller.

**Response:**
```json
{
  "subscription": {
    "name": "Premium",
    "price": 29.99,
    "renewalDate": "2024-02-15",
    "limits": {
      "products": "unlimited",
      "storage": "50GB",
      "analytics": true
    },
    "status": "active",
    "autoRenew": true,
    "startDate": "2024-01-15"
  }
}
```

---

### 3. Get Billing History
**GET** `/api/seller/subscription/invoices`

Get all invoices/billing history for the seller.

**Response:**
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "date": "2024-01-15",
      "amount": 29.99,
      "status": "paid",
      "plan": "Premium",
      "period": "Jan 2024 (Monthly subscription)",
      "commission": 1280.45,
      "processingFees": 145.22,
      "otherFees": 32.15,
      "netPayout": 1103.08,
      "payoutDate": "2024-01-22"
    }
  ]
}
```

---

### 4. Get Payment Methods
**GET** `/api/seller/subscription/payment-methods`

Get all saved payment methods.

**Response:**
```json
{
  "paymentMethods": [
    {
      "id": "pm_1abc123",
      "type": "card",
      "last4": "4242",
      "brand": "Visa",
      "expiry": "12/25",
      "isDefault": true
    }
  ]
}
```

---

### 5. Add Payment Method
**POST** `/api/seller/subscription/payment-methods`

Add a new payment method (card).

**Request Body:**
```json
{
  "cardNumber": "4242424242424242",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "cardholderName": "John Seller"
}
```

**Response:**
```json
{
  "message": "Payment method added successfully",
  "paymentMethod": {
    "id": "pm_1abc123",
    "type": "card",
    "last4": "4242",
    "brand": "Visa",
    "expiry": "12/25",
    "isDefault": true
  }
}
```

**Note:** Payment processing is simulated. Real payment gateway integration will be added later.

---

### 6. Delete Payment Method
**DELETE** `/api/seller/subscription/payment-methods/:id`

Delete a payment method. Cannot delete if it's the only payment method.

**Response:**
```json
{
  "message": "Payment method deleted successfully"
}
```

---

### 7. Set Default Payment Method
**PATCH** `/api/seller/subscription/payment-methods/:id/default`

Set a payment method as default.

**Response:**
```json
{
  "message": "Default payment method updated successfully"
}
```

---

### 8. Upgrade Subscription
**POST** `/api/seller/subscription/upgrade`

Upgrade or downgrade subscription plan. Automatically calculates prorated amount.

**Request Body:**
```json
{
  "tierId": "enterprise"
}
```

**Response:**
```json
{
  "message": "Subscription upgraded successfully",
  "subscription": {
    "name": "Enterprise",
    "price": 99.99,
    "renewalDate": "2024-02-15",
    "limits": {
      "products": "unlimited",
      "storage": "Unlimited",
      "analytics": true
    }
  },
  "payment": {
    "transactionId": "txn_1234567890",
    "amount": 70.00,
    "status": "succeeded"
  }
}
```

**Note:** 
- Payment is simulated (no actual charge)
- Prorated amount is calculated automatically
- Requires a default payment method

---

### 9. Get Payout Schedule
**GET** `/api/seller/subscription/payout-schedule`

Get payout schedule settings.

**Response:**
```json
{
  "frequency": "weekly",
  "nextPayoutDate": "2024-01-22",
  "lastPayoutDate": "2024-01-15"
}
```

---

### 10. Update Payout Schedule
**PATCH** `/api/seller/subscription/payout-schedule`

Update payout frequency.

**Request Body:**
```json
{
  "frequency": "bi_weekly"
}
```

**Valid values:** `weekly`, `bi_weekly`, `monthly`

**Response:**
```json
{
  "message": "Payout schedule updated successfully",
  "frequency": "bi_weekly",
  "nextPayoutDate": "2024-01-29"
}
```

---

## Error Responses

All endpoints return standard error responses:

**401 Unauthorized:**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "message": "Forbidden: insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "No active subscription found"
}
```

**400 Bad Request:**
```json
{
  "message": "Validation error message"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to [operation]"
}
```

---

## Payment Simulation

All payment operations are currently simulated:
- Card tokenization is simulated (no actual payment gateway)
- Payment processing returns success after a short delay
- Transaction IDs are generated but not real
- No actual charges are made

**Message shown to users:**
> "Payment processing integration will be available soon. This is a simulation."

---

## MongoDB Collections Used

1. **plans** - Subscription plan definitions
2. **seller_subscriptions** - Seller subscription data

Make sure these collections exist in your MongoDB database with the structure matching the models.

