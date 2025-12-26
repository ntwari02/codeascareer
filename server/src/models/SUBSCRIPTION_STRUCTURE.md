# Subscription Backend Structure

## MongoDB Collections

### 1. `plans` Collection (Admin-Managed)
**Structure:** Single document containing all subscription plans

```json
{
  "_id": ObjectId("..."),
  "plans": [
    {
      "plan_id": "plan_starter_monthly_usd",
      "tier_id": "starter",
      "tier_name": "Starter",
      ...
    },
    {
      "plan_id": "plan_premium_monthly_usd",
      "tier_id": "premium",
      "tier_name": "Premium",
      ...
    },
    {
      "plan_id": "plan_enterprise_monthly_usd",
      "tier_id": "enterprise",
      "tier_name": "Enterprise",
      ...
    }
  ],
  "metadata": {
    "version": "3.0",
    "schema_version": "3.0",
    "last_updated": "2024-01-15T00:00:00.000Z",
    "currency_default": "USD",
    "supported_currencies": ["USD", "EUR", "GBP"],
    "supported_payment_gateways": ["stripe", "paypal", "momo"],
    "supported_payout_destinations": ["bank_account", "momo", "paypal", "wire_transfer", "ach"]
  }
}
```

**Management:**
- Managed by Admin (admin panel will be built later)
- Single document in collection
- All plans stored in `plans` array
- Admin can update plans, add new plans, modify pricing, etc.

**Backend Access:**
- Uses helper functions: `getPlansFromDB()`, `getPlanByTierId()`, `getPlanByPlanId()`
- Automatically filters by `is_active` and `is_visible`
- Sorted by `sort_order`

---

### 2. `seller_subscriptions` Collection (Per Seller)
**Structure:** Individual document per seller

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "seller_id": "507f191e810c19729de860ea",
  "user_id": "507f191e810c19729de860eb",
  "store_name": "TechHub Electronics",
  "current_plan": { ... },
  "plan_features": { ... },
  "billing_history": [ ... ],
  "payment_methods": [ ... ],
  "payout_settings": { ... },
  ...
}
```

**Management:**
- One document per seller
- Created when seller signs up
- Updated when seller upgrades/downgrades
- Contains all seller-specific subscription data

---

## Backend Implementation

### Models

1. **SubscriptionPlan.ts**
   - Model for `plans` collection (single document)
   - Helper functions to extract plans from document
   - Filters active and visible plans

2. **SellerSubscription.ts**
   - Model for `seller_subscriptions` collection
   - One document per seller
   - Contains all subscription-related data

### Controllers

**subscriptionController.ts** handles:
- `getSubscriptionPlans()` - Fetches from `plans` collection
- `getCurrentSubscription()` - Fetches from `seller_subscriptions`
- `getBillingHistory()` - Gets invoices from seller subscription
- `getPaymentMethods()` - Gets payment methods from seller subscription
- `addPaymentMethod()` - Adds to seller subscription
- `upgradeSubscription()` - Updates seller subscription with new plan
- `getPayoutSchedule()` - Gets payout settings from seller subscription
- `updatePayoutSchedule()` - Updates payout frequency

### Data Flow

1. **Fetching Plans:**
   ```
   Frontend Request → Backend → getPlansFromDB() → Filter active/visible → Transform → Return
   ```

2. **Upgrading Subscription:**
   ```
   Frontend Request → Backend → getPlanByTierId() → Validate → Process Payment (simulated) → Update seller_subscriptions → Return
   ```

3. **Fetching Current Subscription:**
   ```
   Frontend Request → Backend → Find seller_subscriptions by user_id → Transform → Return
   ```

---

## API Endpoints

All endpoints prefixed with: `/api/seller/subscription`

### Public (Authenticated)
- `GET /plans` - Get all available plans

### Seller Only
- `GET /current` - Get current subscription
- `POST /upgrade` - Upgrade/downgrade plan
- `GET /invoices` - Get billing history
- `GET /payment-methods` - Get payment methods
- `POST /payment-methods` - Add payment method
- `DELETE /payment-methods/:id` - Delete payment method
- `PATCH /payment-methods/:id/default` - Set default payment method
- `GET /payout-schedule` - Get payout schedule
- `PATCH /payout-schedule` - Update payout schedule

---

## Data Transformation

The backend automatically transforms MongoDB data to frontend format:

1. **Plans:** `tier_id` → `id`, `tier_name` → `name`, `is_popular` → `popular`
2. **Invoices:** Nested `breakdown` → Flat fields, ISO dates → YYYY-MM-DD
3. **Payment Methods:** `is_default` → `isDefault`, `expiry_display` → `expiry`
4. **Current Plan:** Adds `current: true` flag based on user's subscription

---

## Payment Simulation

- All payment operations are simulated
- No actual payment gateway integration
- Validates card numbers and expiry dates
- Returns success messages indicating simulation
- Ready for real payment gateway integration later

---

## Admin Management (Future)

Admin panel will manage:
- Creating/updating/deleting plans in `plans` collection
- Modifying plan pricing, features, limits
- Viewing all seller subscriptions
- Managing subscription-related settings

The backend is ready and will work seamlessly when admin panel is built.

