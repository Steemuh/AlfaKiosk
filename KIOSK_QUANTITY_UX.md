# Kiosk Quantity UX Implementation Guide

## Overview

This document describes the refactored quantity editing system for the kiosk-style food ordering app. The implementation provides a touch-friendly, keyboard-free interface optimized for mobile and kiosk touchscreens.

## Architecture Changes

### 1. **New Component: QuantitySelector** 
**File:** `src/checkout/sections/Summary/QuantitySelector.tsx`

A new reusable component that replaces the text input field with large touch-friendly +/- buttons.

**Features:**
- **Minimum 48px tap area** for accessibility on touchscreens
- **Large, clearly labeled buttons** with icons (+ and −)
- **Quantity display** in the center showing current quantity
- **Visual feedback** with color-coded buttons:
  - Green for increase (+) button
  - Red for decrease (−) button
  - Gray and disabled state when loading
- **Loading state indicator** during mutations
- **No keyboard input required**

**Props:**
```typescript
interface QuantitySelectorProps {
  quantity: number;              // Current quantity value
  onIncrease: () => void;       // Callback when + is pressed
  onDecrease: () => void;       // Callback when − is pressed
  isLoading?: boolean;          // Show loading state
  disabled?: boolean;           // Disable buttons during operations
}
```

**Styling:**
- Responsive and centered within cart items
- Consistent with kiosk design language (minimalist, high contrast)
- Touch-friendly spacing with 8px gap between buttons
- Active state with visual feedback for affordance

---

### 2. **Enhanced Hook: useSummaryItemForm**
**File:** `src/checkout/sections/Summary/useSummaryItemForm.ts`

Updated to support direct quantity adjustments without form submission.

**New Exports:**
```typescript
increaseQuantity: () => Promise<void>    // Increase by 1
decreaseQuantity: () => Promise<void>    // Decrease by 1 or delete at 0
isQuantityUpdating: boolean               // Mutation in-progress flag
```

**Behavior:**

#### `increaseQuantity()`
- Immediately increases quantity by 1
- Calls `checkoutLinesUpdate` mutation
- Prevents double updates via `isQuantityUpdating` flag
- Disabled during mutation

#### `decreaseQuantity()`
- Decreases quantity by 1
- **Auto-removes line when quantity reaches 0** (no confirmation needed)
- Calls `checkoutLineDelete` mutation at quantity 0
- Calls `checkoutLinesUpdate` mutation for quantities > 0
- Prevents double updates via `isQuantityUpdating` flag
- Disabled during mutation

**Mutation Details:**
- Uses Saleor's `checkoutLinesUpdate` mutation for quantity changes
- Uses Saleor's `checkoutLineDelete` mutation for removal at 0
- Extracts `languageCode` and `checkoutId` from form context
- No schema changes required

---

### 3. **Refactored Component: SummaryItemMoneyEditableSection**
**File:** `src/checkout/sections/Summary/SummaryItemMoneyEditableSection.tsx`

Simplified to use the new QuantitySelector component.

**Changes:**
- Removed `TextInput` field for quantity
- Integrated `QuantitySelector` component
- Connected to new `increaseQuantity` and `decreaseQuantity` hooks
- Displays loading skeleton during mutations
- Much simpler implementation (removed form handling complexity)

**Usage:**
```tsx
<SummaryItemMoneyEditableSection line={checkoutLine} />
```

---

### 4. **Updated Component: SummaryItemMoneySection**
**File:** `src/checkout/sections/Summary/SummaryItemMoneySection.tsx`

Updated to display quantities as read-only during checkout.

**Changes:**
- Shows "Qty: {quantity}" in a disabled-looking container
- Matches QuantitySelector visual style for consistency
- Prevents accidental editing during payment
- Read-only appearance with neutral styling (gray background)

**Usage:**
```tsx
<SummaryItemMoneySection line={orderLine} />
```

---

## Data Flow

### Cart View (Editable)
```
User clicks + or − button
         ↓
QuantitySelector triggers onIncrease/onDecrease
         ↓
increaseQuantity() or decreaseQuantity() hook
         ↓
Saleor checkoutLinesUpdate or checkoutLineDelete mutation
         ↓
isQuantityUpdating = true (buttons disabled)
         ↓
Mutation completes → UI updates automatically
         ↓
isQuantityUpdating = false (buttons enabled)
```

### Checkout View (Read-Only)
```
Summary component with editable=false
         ↓
Uses SummaryItemMoneySection instead of SummaryItemMoneyEditableSection
         ↓
Displays "Qty: {quantity}" in read-only format
         ↓
No editing possible
```

---

## UI/UX Specifications

### Button Sizing
- **Width:** 48px (minimum accessibility standard)
- **Height:** 48px (minimum accessibility standard)
- **Border:** 2px (visual clarity)
- **Padding:** Centered content with flex

### Spacing
- **Gap between buttons:** 8px
- **Gap between quantity display and buttons:** 8px
- **Border radius:** 4px (rounded corners)

### Color Scheme
- **Increase Button (Green):**
  - Default: `bg-green-50` + `border-green-300` + `text-green-600`
  - Hover: `bg-green-100` + `border-green-400`
  - Active: `bg-green-200`
  - Disabled: `bg-neutral-100` + `border-neutral-200` + `text-neutral-400`

- **Decrease Button (Red):**
  - Default: `bg-red-50` + `border-red-300` + `text-red-600`
  - Hover: `bg-red-100` + `border-red-400`
  - Active: `bg-red-200`
  - Disabled (when quantity ≤ 1): Same as disabled above

- **Quantity Display:**
  - Normal: `bg-neutral-50` + `border-neutral-200`
  - During mutation: No change
  - Large font: `text-lg font-bold`

### Accessibility
- **ARIA Labels:** Each button has `aria-label` for screen readers
- **Loading Indicator:** Uses `aria-live="polite"` for updates
- **Disabled State:** Buttons have `disabled` attribute and visual feedback
- **Keyboard Support:** Not applicable (kiosk optimized)

---

## Implementation Checklist

### ✅ Requirements Implemented

- [x] Quantity editable directly in cart view
- [x] Removed raw `<input type="number">` field
- [x] Large, touch-friendly +/− buttons (48px minimum)
- [x] + button increases quantity by 1
- [x] − button decreases quantity by 1
- [x] Auto-remove line when quantity reaches 0
- [x] "Remove" action made secondary (handled by − to 0)
- [x] Uses Saleor's `checkoutLinesUpdate` mutation
- [x] Uses Saleor's `checkoutLineDelete` mutation (at 0)
- [x] Buttons disabled during mutation (prevents double updates)
- [x] No backend/GraphQL schema changes
- [x] Optimized for mobile and kiosk touchscreens
- [x] No keyboard input required
- [x] Minimal scrolling (compact design)
- [x] Cart is primary place for quantity adjustments
- [x] Checkout shows quantities as read-only
- [x] Quantities not editable during checkout

---

## Files Modified

```
src/checkout/sections/Summary/
├── QuantitySelector.tsx              [NEW]
├── useSummaryItemForm.ts             [UPDATED]
├── SummaryItemMoneyEditableSection.tsx [REFACTORED]
└── SummaryItemMoneySection.tsx        [UPDATED]
```

---

## Testing Recommendations

### Unit Tests
- [ ] QuantitySelector renders with correct quantity
- [ ] QuantitySelector calls onIncrease on + click
- [ ] QuantitySelector calls onDecrease on − click
- [ ] Decrease button disabled when quantity = 1
- [ ] Loading state disables both buttons
- [ ] Quantity display updates correctly

### Integration Tests
- [ ] Increase quantity triggers mutation
- [ ] Decrease quantity triggers mutation
- [ ] Quantity 0 triggers delete mutation
- [ ] Buttons disabled during mutation
- [ ] Cart updates after mutation success
- [ ] Error handling reverts state

### E2E Tests
- [ ] Add item to cart, then adjust quantity via +/−
- [ ] Decrease to 0 removes item from cart
- [ ] Proceed to checkout - quantities show as read-only
- [ ] Checkout view prevents quantity editing
- [ ] Touch gestures work on mobile devices

---

## Troubleshooting

### Issue: Buttons not triggering updates
- **Check:** `useCheckoutLinesUpdateMutation` and `useCheckoutLineDeleteMutation` imports
- **Verify:** `languageCode` and `checkoutId` are available in form context
- **Debug:** Check browser console for GraphQL errors

### Issue: Double updates occurring
- **Check:** `isQuantityUpdating` state is properly passed to QuantitySelector
- **Verify:** Buttons are disabled during `isQuantityUpdating === true`
- **Solution:** Ensure `disabled={isQuantityUpdating}` prop is set

### Issue: Item not removing at quantity 0
- **Check:** `decreaseQuantity` function logic for `newQuantity === 0` condition
- **Verify:** `checkoutLineDelete` mutation is configured correctly
- **Debug:** Check that line ID is properly extracted

### Issue: Read-only view still editable in checkout
- **Check:** Checkout component passes `editable={false}` to Summary
- **Verify:** Summary renders `SummaryItemMoneySection` instead of `SummaryItemMoneyEditableSection`
- **Solution:** Look at Checkout.tsx line 58-62 for conditional rendering

---

## Future Improvements

- [ ] Add quantity input validation (max quantity limits)
- [ ] Add haptic feedback for touch events (mobile)
- [ ] Implement quantity presets (quick buttons: 1x, 2x, 3x)
- [ ] Add animation when item is deleted
- [ ] Implement undo/confirmation for deletion
- [ ] Add sound effects for accessibility
- [ ] Support for batch operations (multiple items)

---

## Migration Notes

If upgrading from the previous version:
1. Old `TextInput` quantity field is completely removed
2. Form handling is simplified - no more `FormProvider` wrapper
3. Direct mutation calls replace form submission
4. State management uses `isQuantityUpdating` instead of form `isSubmitting`

No data migration needed - fully backward compatible with existing checkout data.
