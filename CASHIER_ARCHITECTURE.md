# Cashier Interface - Component Structure

## Directory Layout

```
src/
├── app/
│   ├── cashier-context.tsx           # Global role state management
│   ├── role-selector.tsx             # Landing page (role selection)
│   ├── page.tsx                      # Updated to show role selector
│   ├── layout.tsx                    # Updated with CashierProvider
│   └── cashier/
│       └── page.tsx                  # Main cashier dashboard
│
└── cashier/
    ├── tabs/
    │   ├── IncomingOrdersTab.tsx     # New/unconfirmed orders
    │   ├── PreparingOrdersTab.tsx    # Active preparation orders
    │   └── ReadyForPickupTab.tsx     # Awaiting customer handover
    │
    └── components/
        └── OrderCard.tsx             # Reusable order display card
```

## Component Hierarchy

```
RootLayout (with CashierProvider)
├── RoleSelector (@ /)
│   └── Choose: Customer or Cashier
│
└── Channel Routes
    ├── Customer Flow: /[channel]/... (existing)
    │
    └── Cashier Flow: /cashier
        └── CashierDashboard
            ├── TopBar (title, switch role)
            ├── TabNavigation (Incoming | Preparing | Ready)
            │
            ├── IncomingOrdersTab
            │   ├── StatCards (New Orders, Total, Avg Wait, Acceptance Rate)
            │   └── OrderList
            │       └── OrderCard (with Accept/Reject buttons)
            │
            ├── PreparingOrdersTab
            │   ├── StatCards (Currently Preparing, Avg Prep Time, Peak Hours)
            │   └── OrderList
            │       └── OrderCard (with View Items/Mark Ready buttons)
            │
            └── ReadyForPickupTab
                ├── StatCards (Ready Orders, Handover Rate, Avg Wait)
                └── OrderList
                    └── OrderCard (with View Details/Handed Over buttons)
```

## Component Props & Interfaces

### CashierProvider
```typescript
interface CashierContextType {
  role: 'cashier' | 'customer' | null;
  isCashier: boolean;
  setRole: (role: 'cashier' | 'customer') => void;
}
```

### OrderCard
```typescript
interface OrderCardProps {
  order: {
    id: string;
    orderId: string;
    customerName: string;
    pickupTime: string;
    elapsedTime: string;
    items: number;
    status: string;
  };
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  showActions?: boolean;
  actionLabels?: {
    accept?: string;
    reject?: string;
  };
}
```

## Key Features by Component

### CashierDashboard (/cashier)
- ✅ Access control (cashier role only)
- ✅ Tab switching (Incoming/Preparing/Ready)
- ✅ Role switcher button
- ✅ Responsive layout

### OrderCard
- ✅ Status badges with colors
- ✅ Priority indicators (animated pulse for new)
- ✅ Expandable details
- ✅ Custom action button labels
- ✅ Clickable for expansion

### Tab Components
- ✅ Mock data for testing
- ✅ Stats cards with relevant metrics
- ✅ Empty states
- ✅ Order filtering by status
- ✅ Action handlers (ready for API integration)

## Styling Approach

- **Color Scheme:**
  - Cashier: Dark slate (slate-800/900) with emerald accents
  - Status Red: New orders (#EF4444)
  - Status Yellow: Preparing (#FBBF24)
  - Status Green: Ready (#22C55E)
  - Status Blue: Incoming (#3B82F6)

- **Typography:**
  - Inter font (existing)
  - Bold headers for order IDs
  - High contrast for accessibility

- **Spacing:**
  - Generous padding for touch interaction
  - Clear visual separation between orders
  - Responsive grid layouts

## State Management

### Current Implementation
- React Context for role persistence
- Component-level useState for tab active state
- localStorage for role persistence across sessions

### Ready for Enhancement
- Zustand (already in project) for order state management
- GraphQL caching with URQL
- Real-time subscriptions for webhook updates

## Accessibility Features

- ✅ High contrast colors (WCAG AA compliant)
- ✅ Large touch targets (48x48px minimum)
- ✅ Clear visual feedback on interactions
- ✅ Semantic HTML structure
- ✅ Keyboard navigable (implicit from Next.js)
- ✅ Status badges for color-blind users (text + color)

---

**Status:** ✅ Foundation complete, ready for API integration
