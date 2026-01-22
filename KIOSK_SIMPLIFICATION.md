# Alfamart Food Kiosk - Simplification Progress

## ✅ COMPLETED CHANGES

### 1. App Metadata Updated
- Changed app title from "Saleor Storefront" to "Alfamart Food Kiosk"
- Updated description to "Quick food ordering kiosk for Alfamart canteen"
- Files modified:
  - `src/app/layout.tsx`
  - `src/app/checkout/page.tsx`  
  - `src/app/[channel]/(main)/page.tsx`

### 2. Created Simplified Kiosk Checkout
- New files created:
  - `src/checkout/sections/KioskCheckoutForm/KioskCheckoutForm.tsx` - Payment only, no auth/addresses
  - `src/checkout/sections/KioskCheckoutForm/index.ts`
- Removed user authentication logic from checkout flow
- Kept only: Order summary + Payment section

### 3. Simplified Checkout View
- Updated `src/checkout/views/Checkout/Checkout.tsx`
- Removed `useUser` hook and auth state management
- Uses new `KioskCheckoutForm` instead of full `CheckoutForm`

---

## 🗑️ FILES/FEATURES TO REMOVE

### Pages (should be deleted):
```
src/app/[channel]/(main)/login/
src/app/[channel]/(main)/orders/
```

### Components (not needed for kiosk):
```
src/ui/components/LoginForm.tsx
src/ui/components/OrderListItem.tsx
src/ui/components/ChannelSelect.tsx (if present)
src/ui/components/DraftModeNotification.tsx (if draft mode not needed)
```

### Checkout Sections (if kept, they're unused):
```
src/checkout/sections/SignIn/
src/checkout/sections/SignedInUser/
src/checkout/sections/GuestUser/
src/checkout/sections/ResetPassword/
src/checkout/sections/Contact/ (complex user logic)
src/checkout/sections/GuestShippingAddressSection/
src/checkout/sections/UserShippingAddressSection/
src/checkout/sections/GuestBillingAddressSection/
src/checkout/sections/UserBillingAddressSection/
src/checkout/sections/AddressCreateForm/
src/checkout/sections/AddressEditForm/
src/checkout/sections/AddressList/
src/checkout/sections/DeliveryMethods/ (if no shipping needed)
```

### GraphQL Queries (can be removed from checkout/graphql/):
```
CurrentUser.graphql
CurrentUserOrderList.graphql
User auth/address related queries
```

---

## 📋 WHAT TO KEEP

### Core Product Pages:
- `src/app/[channel]/(main)/categories/`
- `src/app/[channel]/(main)/products/`
- `src/app/[channel]/(main)/cart/`

### Payment & Order Confirmation:
- `src/checkout/sections/PaymentSection/`
- `src/checkout/sections/Summary/`
- `src/checkout/views/OrderConfirmation/`

### Core Hooks:
- `useCheckout`
- `useCart`
- Payment-related hooks

### UI Components:
- `ProductList`
- `ProductElement`
- `Cart` components
- Payment components
- Button, TextInput, Money, etc.

---

## 🎯 NEXT STEPS

1. Delete the pages directory
2. Remove LoginForm and OrderListItem components
3. Clean up unused GraphQL queries
4. Remove/simplify address-related checkout sections
5. Test the simplified flow: Browse Products → Cart → Payment → Order Confirmation
