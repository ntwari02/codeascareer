# Frontend-Backend Field Mapping Analysis

## ✅ MATCHING FIELDS

### 1. TIER/PLAN STRUCTURE

**Frontend Expects (Tier interface):**
- id: string
- name: string  
- price: number
- features: string[]
- limits: { products: string, storage: string, analytics: boolean }
- current?: boolean
- popular?: boolean

**Your MongoDB Plans Document:**
- ✅ tier_id → matches "id" (needs mapping: tier_id → id)
- ✅ tier_name → matches "name" (needs mapping: tier_name → name)
- ✅ price → matches "price"
- ✅ features → matches "features" (array)
- ✅ limits.products.display → matches "limits.products" (needs mapping)
- ✅ limits.storage.limit_display → matches "limits.storage" (needs mapping)
- ✅ limits.analytics.enabled → matches "limits.analytics" (needs mapping)
- ✅ is_popular → matches "popular" (needs mapping: is_popular → popular)
- ⚠️ MISSING: "current" field (needs to be added based on user's subscription)

**Mapping Needed:**
```javascript
// Transform MongoDB plan to frontend Tier
{
  id: plan.tier_id,           // ✅
  name: plan.tier_name,       // ✅
  price: plan.price,           // ✅
  features: plan.features,     // ✅
  limits: {
    products: plan.limits.products.display,      // ✅
    storage: plan.limits.storage.limit_display,  // ✅
    analytics: plan.limits.analytics.enabled     // ✅
  },
  popular: plan.is_popular,    // ✅
  current: userSubscription.tier_id === plan.tier_id  // ⚠️ NEEDS CALCULATION
}
```

---

### 2. INVOICE STRUCTURE

**Frontend Expects (Invoice interface):**
- id: string
- date: string
- amount: number
- status: 'paid' | 'pending' | 'failed'
- plan: string
- period: string
- commission: number
- processingFees: number
- otherFees: number
- netPayout: number
- payoutDate: string

**Your MongoDB Seller Subscription Document:**
- ✅ billing_history[].invoice_id → matches "id" (needs mapping: invoice_id → id)
- ✅ billing_history[].date → matches "date" (needs date format conversion)
- ✅ billing_history[].subscription_amount → matches "amount" (needs mapping)
- ✅ billing_history[].status → matches "status" ✅
- ✅ billing_history[].plan_name → matches "plan" ✅
- ✅ billing_history[].period → matches "period" ✅
- ✅ billing_history[].breakdown.gross_commission → matches "commission" (needs mapping)
- ✅ billing_history[].breakdown.processing_fees → matches "processingFees" (needs mapping)
- ✅ billing_history[].breakdown.other_fees → matches "otherFees" (needs mapping)
- ✅ billing_history[].breakdown.net_payout → matches "netPayout" (needs mapping)
- ✅ billing_history[].payout.scheduled_date → matches "payoutDate" (needs date format conversion)

**Mapping Needed:**
```javascript
// Transform MongoDB invoice to frontend Invoice
{
  id: invoice.invoice_id,                    // ✅
  date: formatDate(invoice.date),             // ✅ (ISO to YYYY-MM-DD)
  amount: invoice.subscription_amount,        // ✅
  status: invoice.status,                    // ✅
  plan: invoice.plan_name,                   // ✅
  period: invoice.period,                     // ✅
  commission: invoice.breakdown.gross_commission,      // ✅
  processingFees: invoice.breakdown.processing_fees,   // ✅
  otherFees: invoice.breakdown.other_fees,             // ✅
  netPayout: invoice.breakdown.net_payout,             // ✅
  payoutDate: formatDate(invoice.payout.scheduled_date) // ✅
}
```

---

### 3. PAYMENT METHODS STRUCTURE

**Frontend Expects:**
- id: string
- type: string
- last4: string
- brand: string
- expiry: string (format: "MM/YY")
- isDefault: boolean

**Your MongoDB Seller Subscription Document:**
- ✅ payment_methods[].payment_method_id → matches "id" (needs mapping)
- ✅ payment_methods[].type → matches "type" ✅
- ✅ payment_methods[].last4 → matches "last4" ✅
- ✅ payment_methods[].brand → matches "brand" ✅
- ✅ payment_methods[].expiry_display → matches "expiry" ✅
- ✅ payment_methods[].is_default → matches "isDefault" (needs mapping: is_default → isDefault)

**Mapping Needed:**
```javascript
// Transform MongoDB payment method to frontend format
{
  id: method.payment_method_id,     // ✅
  type: method.type,                 // ✅
  last4: method.last4,               // ✅
  brand: method.brand,              // ✅
  expiry: method.expiry_display,    // ✅
  isDefault: method.is_default      // ✅
}
```

---

### 4. CURRENT PLAN DISPLAY

**Frontend Expects:**
- name: string (from currentPlan.name)
- price: number (from currentPlan.price)
- renewalDate: string (format: "YYYY-MM-DD")
- limits: { products: string, storage: string, analytics: boolean }

**Your MongoDB Seller Subscription Document:**
- ✅ current_plan.tier_name → matches "name" ✅
- ✅ current_plan.price → matches "price" ✅
- ✅ current_plan.renewal_date → matches "renewalDate" (needs date format conversion)
- ✅ plan_features.product_limit → matches "limits.products" (needs mapping)
- ✅ plan_features.storage_limit → matches "limits.storage" ✅
- ✅ plan_features.analytics_enabled → matches "limits.analytics" ✅

**Mapping Needed:**
```javascript
{
  name: current_plan.tier_name,                    // ✅
  price: current_plan.price,                      // ✅
  renewalDate: formatDate(current_plan.renewal_date), // ✅
  limits: {
    products: plan_features.product_limit,         // ✅
    storage: plan_features.storage_limit,         // ✅
    analytics: plan_features.analytics_enabled     // ✅
  }
}
```

---

### 5. PAYOUT SCHEDULE

**Frontend Expects:**
- frequency: string ('weekly' | 'bi-weekly' | 'monthly')
- nextPayoutDate: string (format: "YYYY-MM-DD")

**Your MongoDB Seller Subscription Document:**
- ✅ payout_settings.frequency → matches "frequency" ✅
- ✅ payout_settings.next_payout_date → matches "nextPayoutDate" (needs date format conversion)

**Mapping Needed:**
```javascript
{
  frequency: payout_settings.frequency,                    // ✅
  nextPayoutDate: formatDate(payout_settings.next_payout_date) // ✅
}
```

---

## ⚠️ ISSUES TO FIX

### 1. FIELD NAME MISMATCHES (Snake_case vs camelCase)
- MongoDB uses: `is_default`, `tier_id`, `tier_name`, `invoice_id`, `payment_method_id`
- Frontend expects: `isDefault`, `id`, `name`, `id`, `id`
- **Solution:** Backend API should transform field names when sending to frontend

### 2. DATE FORMAT DIFFERENCES
- MongoDB stores: ISO 8601 format ("2024-01-15T00:00:00.000Z")
- Frontend expects: Simple date string ("2024-01-15")
- **Solution:** Backend should format dates before sending

### 3. NESTED STRUCTURE DIFFERENCES
- MongoDB: `breakdown.gross_commission`
- Frontend: `commission` (flat)
- **Solution:** Backend should flatten nested structures

### 4. MISSING "current" FLAG ON PLANS
- Frontend needs to know which plan is current for the user
- **Solution:** Backend should add `current: true` to the plan matching user's subscription

### 5. FREQUENCY VALUE MAPPING
- MongoDB: `"weekly"`, `"bi_weekly"`, `"monthly"`
- Frontend dropdown: `"Weekly"`, `"Bi-weekly"`, `"Monthly"`
- **Solution:** Backend should map values or frontend should handle both formats

---

## ✅ SUMMARY

**GOOD NEWS:**
- ✅ All required data exists in your MongoDB documents
- ✅ Field values match (just different naming conventions)
- ✅ Data structure is comprehensive and professional

**WHAT YOU NEED:**
1. Backend API transformation layer to map MongoDB fields to frontend format
2. Date formatting utility (ISO → YYYY-MM-DD)
3. Field name conversion (snake_case → camelCase)
4. Logic to add "current" flag to plans based on user subscription
5. Flatten nested structures (breakdown → flat fields)

**YOUR DOCUMENTS ARE COMPATIBLE** - You just need the backend API to transform the data format when sending to frontend!

