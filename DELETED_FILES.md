# Deleted Files & Directories

This file documents what was removed from the Saleor storefront to simplify it for the Alfamart food kiosk app.

## Files Deleted ✂️

### UI Components
- `src/ui/components/LoginForm.tsx` - User login form (auth page)
- `src/ui/components/OrderListItem.tsx` - Order history component

### Pages (Directories)
- `src/app/[channel]/(main)/login/` - Login page and route
  - Contents: `page.tsx`
- `src/app/[channel]/(main)/orders/` - Order history page and route
  - Contents: `page.tsx`

## Import Statements Removed ✏️

### From `src/app/layout.tsx`
```tsx
// REMOVED:
import { DraftModeNotification } from "@/ui/components/DraftModeNotification";

// REMOVED FROM JSX:
<Suspense>
  <DraftModeNotification />
</Suspense>
```

### From `src/ui/components/Footer.tsx`
```tsx
// REMOVED:
import { ChannelSelect } from "./ChannelSelect";
import { ChannelsListDocument, MenuGetBySlugDocument } from "@/gql/graphql";

// REMOVED LOGIC:
const channels = process.env.SALEOR_APP_TOKEN ? ... // entire block

// REMOVED FROM JSX:
{channels?.channels && (
  <div className="mb-4 text-neutral-500">
    <label>
      <span className="text-sm">Change currency:</span> 
      <ChannelSelect channels={channels.channels} />
    </label>
  </div>
)}
```

## Files NOT Deleted (But Could Be Later)

If you want to further simplify checkout in the future, these could be removed:

```
src/checkout/sections/
  - SignIn/
  - SignedInUser/
  - ResetPassword/
  - GuestUser/
  - Contact/
  - GuestShippingAddressSection/
  - UserShippingAddressSection/
  - GuestBillingAddressSection/
  - UserBillingAddressSection/
  - AddressCreateForm/
  - AddressEditForm/
  - AddressList/
  - DeliveryMethods/

src/checkout/components/
  - Address.tsx
  - AddressSkeleton.tsx
  - AddressSectionSkeleton.tsx
  - CountrySelect.tsx
  - PasswordInput/

src/ui/components/
  - ChannelSelect.tsx (not deleted yet - only removed from Footer)
  - DraftModeNotification.tsx (not deleted yet - only removed from layout)
```

## Database/GraphQL Queries Still Available (Kept)

These were NOT deleted - they're still part of the codebase but are simply not used in the kiosk checkout flow:

- `CurrentUser.graphql` - User auth query
- `CurrentUserOrderList.graphql` - Order history query
- User address-related queries

If you want to completely clean the GraphQL folder, you can remove these later.

## Migration Path

If you need to restore any of these features later:

1. **Git Recovery** (if using version control):
   ```bash
   git log --oneline -- src/ui/components/LoginForm.tsx
   git checkout <commit-hash> -- src/ui/components/LoginForm.tsx
   ```

2. **Manual Restoration**:
   - The original Saleor storefront repo has all these files
   - You can copy them back if needed

## Summary

- **Total files deleted:** 2
- **Total directories deleted:** 2
- **Components removed:** 2
- **GraphQL operations still available:** Yes (unused)
- **Checkout flow simplified:** Yes

This represents the minimal viable simplification to convert the full storefront into a food kiosk app.

---

**Deletion Date:** January 6, 2026  
**Reason:** Simplification for Alfamart Food Kiosk Ordering System
