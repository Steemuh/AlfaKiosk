# Alfamart Food Kiosk Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ALFAMART FOOD KIOSK                      │
│                                                             │
│  QR CODE SCANNER → HOME PAGE → PRODUCT SELECTION            │
│       ↓              ↓               ↓                       │
│   Location ID   Featured Items   Categories                 │
│                                                             │
│                    SHOPPING CART                            │
│                    (Add/Remove)                             │
│                         ↓                                   │
│              SIMPLIFIED CHECKOUT                            │
│                    (Payment Only)                           │
│                         ↓                                   │
│            PAYMENT GATEWAY (Stripe/Adyen)                   │
│                         ↓                                   │
│            ORDER CONFIRMATION + RECEIPT                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌──────────────────┐
│   Saleor Admin   │  (Product Management)
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│   Saleor GraphQL API             │
└────────┬─────────────────────────┘
         │
         ├─→ Product List
         ├─→ Categories
         ├─→ Create Checkout
         ├─→ Add to Checkout
         └─→ Complete Checkout
         
         ↓
┌──────────────────────────────────┐
│   Next.js Frontend (Kiosk UI)    │
│                                  │
│  ✅ HOME PAGE                    │
│  ✅ PRODUCT PAGES                │
│  ✅ CART                          │
│  ✅ CHECKOUT (Simplified)         │
│  ✅ ORDER CONFIRMATION            │
│                                  │
│  ❌ LOGIN/REGISTER               │
│  ❌ MY ACCOUNT                    │
│  ❌ ORDER HISTORY                 │
│  ❌ SHIPPING ADDRESS              │
│                                  │
└──────────────────────────────────┘
```

---

## Component Hierarchy

```
RootLayout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── Cart Icon
├── Main Route
│   ├── [channel]/
│   │   └── (main)/
│   │       ├── page.tsx (HOME - Featured Products)
│   │       ├── products/[slug]/page.tsx
│   │       ├── categories/[slug]/page.tsx
│   │       └── cart/page.tsx
│   └── checkout/page.tsx
│       └── RootWrapper (Checkout Providers)
│           └── RootViews
│               ├── Checkout (if no order)
│               │   ├── KioskCheckoutForm ⭐ NEW
│               │   │   └── PaymentSection
│               │   └── Summary
│               └── OrderConfirmation (if order completed)
└── Footer

Legend:
  ⭐ NEW = Created for kiosk
  ✅ KEPT = Used in kiosk
  ❌ REMOVED = Not in kiosk
```

---

## Checkout Flow Comparison

### ORIGINAL (Full Storefront)
```
┌────────────────────┐
│  Checkout Page     │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Contact/Email     │ (SignIn/GuestUser)
│  - Login           │
│  - Register        │
│  - Enter email     │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Shipping Address  │ (UserShippingAddressSection)
│  - Select/Enter    │
│  - Validate        │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Billing Address   │ (UserBillingAddressSection)
│  - Select/Enter    │
│  - Validate        │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Shipping Methods  │ (DeliveryMethods)
│  - Select method   │
│  - Calculate cost  │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Payment           │ (PaymentSection)
│  - Enter card      │
│  - Process payment │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Order Confirm     │
└────────────────────┘
```

### NEW (Kiosk - Simplified)
```
┌────────────────────┐
│  Home / Products   │
│  Add to Cart       │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Review Cart       │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  KioskCheckoutForm │ ⭐ NEW
│  - Review Order    │
│  - Select Payment  │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Payment           │
│  (Stripe/Adyen)    │
└────────┬───────────┘
         ↓
┌────────────────────┐
│  Order Confirm     │
│  + Receipt #       │
│  + Pickup Info     │
└────────────────────┘

Removed Steps:
  ❌ User login
  ❌ Address entry
  ❌ Shipping selection
  ❌ Account creation
```

---

## File Changes Visual

```
BEFORE (Saleor Storefront)
────────────────────────────────
src/
├── app/
│   ├── [channel]/(main)/
│   │   ├── login/           ❌ DELETED
│   │   ├── orders/          ❌ DELETED
│   │   ├── cart/            ✅ KEPT
│   │   ├── products/        ✅ KEPT
│   │   └── categories/      ✅ KEPT
│   └── checkout/            ✅ KEPT
├── checkout/
│   └── sections/
│       ├── SignIn/          ❓ UNUSED
│       ├── GuestUser/       ❓ UNUSED
│       ├── Contact/         ❓ UNUSED
│       ├── KioskCheckoutForm/ ⭐ NEW
│       ├── PaymentSection/  ✅ KEPT
│       ├── Summary/         ✅ KEPT
│       └── Address*/        ❓ UNUSED
└── ui/components/
    ├── LoginForm.tsx        ❌ DELETED
    ├── OrderListItem.tsx    ❌ DELETED
    ├── Footer.tsx           ✏️ MODIFIED
    └── *                    ✅ KEPT

Legend:
  ✅ KEPT = Used in kiosk app
  ❌ DELETED = Removed from kiosk
  ❓ UNUSED = In code but not used
  ⭐ NEW = Created for kiosk
  ✏️ MODIFIED = Updated for kiosk
```

---

## Key Component Flow

### Home Page Flow
```
[channel]/(main)/page.tsx
  ↓
  Fetch featured products collection
  ↓
  <ProductList products={products} />
  ↓
  ProductElement for each item
  ↓
  [Add to Cart] button
```

### Cart Page Flow
```
cart/page.tsx
  ↓
  useCheckout() → get checkout data
  ↓
  Display cart items with:
    - Product name
    - Quantity
    - Price
    - Remove button
  ↓
  [Proceed to Checkout] button
```

### Checkout Flow (NEW)
```
checkout/page.tsx
  ↓
  RootWrapper (Auth + GraphQL client)
  ↓
  RootViews (logic)
  ↓
  Checkout view
  ↓
  ┌──────────────────────────────┐
  │  KioskCheckoutForm ⭐ NEW    │  (Payment only)
  ├──────────────────────────────┤
  │  Summary (Order total)       │
  └──────────────────────────────┘
  ↓
  PaymentSection (Stripe/Adyen)
  ↓
  OrderConfirmation (success)
```

---

## Technology Stack

```
Frontend:
  • Next.js 16 (React 19)
  • TypeScript
  • Tailwind CSS
  • Formik (forms)
  • Yup (validation)
  • React Toastify (notifications)

Backend/API:
  • Saleor GraphQL API
  • URQL (GraphQL client)
  • Stripe/Adyen (payments)

Auth:
  • Saleor Auth SDK (for backend auth only)

State:
  • React Hooks
  • Custom checkout hooks
```

---

## Environment Variables Needed

```
# Saleor API
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor.com/graphql/

# Storefront
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000

# Auth (optional, for admin features)
SALEOR_APP_TOKEN=your_app_token_here
```

---

## Database/Content Management

```
Saleor Admin Panel (Backend)
  ↓
  Manage:
    - Products (Food items)
    - Categories (Viands, Beverages, Desserts)
    - Prices & inventory
    - Images
    - Attributes (Spicy level, etc.)
  ↓
  GraphQL API (Published)
  ↓
  Kiosk App (Displays)
    - Queries available products
    - Shows to customers
    - Processes orders
```

---

**Diagram Version:** 1.0  
**Created:** January 6, 2026  
**For:** Alfamart Food Kiosk System
