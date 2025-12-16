# Project Migration Guide

## Progress So Far ✅

### Completed:
1. ✅ Path aliases configured (`@/` → `src/`)
2. ✅ UI components moved to `src/components/ui/`:
   - button.tsx
   - dialog.tsx
   - toast.tsx
   - toaster.tsx
   - use-toast.ts
3. ✅ Utils moved to `src/lib/utils.ts`
4. ✅ Core dashboard components moved to `src/components/dashboard/`:
   - Sidebar.tsx
   - Header.tsx
   - StatCard.tsx
   - Notifications.tsx
   - RecentOrders.tsx
   - SalesChart.tsx
5. ✅ Started seller pages: `src/pages/seller/DashboardOverview.tsx`

## Remaining Files to Move

### Dashboard Components (src/components/dashboard/):
- [ ] InventoryManagement.jsx → InventoryManagement.tsx
- [ ] OrdersPage.jsx → OrdersPage.tsx
- [ ] DisputeResolution.jsx → DisputeResolution.tsx
- [ ] ProductManagement.jsx → ProductManagement.tsx
- [ ] Analytics.jsx → Analytics.tsx
- [ ] SubscriptionTiers.jsx → SubscriptionTiers.tsx
- [ ] ProfilePage.jsx → ProfilePage.tsx
- [ ] Settings.jsx → Settings.tsx

### Admin Pages (src/pages/admin/):
- [ ] AdminAlerts.jsx → AdminAlerts.tsx
- [ ] AdminDashboard.jsx → AdminDashboard.tsx
- [ ] AdminDisputeManagement.jsx → AdminDisputeManagement.tsx
- [ ] AdminOverview.jsx → AdminOverview.tsx
- [ ] ContentModeration.jsx → ContentModeration.tsx
- [ ] PlatformAnalytics.jsx → PlatformAnalytics.tsx
- [ ] ReportsExports.jsx → ReportsExports.tsx
- [ ] SellerPerformance.jsx → SellerPerformance.tsx
- [ ] SellerVerification.jsx → SellerVerification.tsx
- [ ] SystemSettings.jsx → SystemSettings.tsx
- [ ] TransactionMonitoring.jsx → TransactionMonitoring.tsx
- [ ] UserManagement.jsx → UserManagement.tsx

### Seller Pages (src/pages/seller/):
- [ ] All dashboard pages should be moved here (they're currently in dashboard folder)

### Components:
- [ ] SellerDashboard.jsx → src/components/SellerDashboard.tsx
- [ ] CallToAction.jsx → src/components/CallToAction.tsx (if needed)

## Migration Steps

1. **Read each .jsx file** from `client/New folder/New folder/src/`
2. **Convert to TypeScript**:
   - Change extension from `.jsx` to `.tsx`
   - Add TypeScript types for props
   - Update imports to use `@/` aliases
3. **Update imports**:
   - `@/components/dashboard/` → `@/components/dashboard/`
   - `@/components/ui/` → `@/components/ui/`
   - `@/lib/utils` → `@/lib/utils`
   - `@/components/admin/` → `@/pages/admin/` (for admin pages)
4. **Write to correct location**:
   - Dashboard components → `src/components/dashboard/`
   - Admin pages → `src/pages/admin/`
   - Seller pages → `src/pages/seller/`

## Next Steps

1. Continue moving remaining dashboard components
2. Move all admin pages
3. Move seller dashboard wrapper
4. Update main App.tsx to include routes:
   - `/seller/*` → SellerDashboard
   - `/admin/*` → AdminDashboard
5. Test all routes
6. Clean up `New folder` directory

## Route Integration

Update `client/src/App.tsx` to include:

```tsx
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// In Routes:
<Route path="seller/*" element={<SellerDashboard />} />
<Route path="admin/*" element={<AdminDashboard />} />
```

 