# PayRex Integration - Developer Setup Checklist

## Copy-Paste Configuration

### 1. Environment Variables (.env.local)

```bash
# apps/storefront/.env.local

# ===== Existing Variables (Keep These) =====
NEXT_PUBLIC_SALEOR_API_URL=https://store-lzhtbcf7.saleor.cloud/graphql/
NEXT_PUBLIC_DEFAULT_CHANNEL=ph-kiosk
SALEOR_APP_TOKEN=zKjhxkFOejPubTBQcQ24wNr38oHRon

# ===== ADD THESE NEW VARIABLES =====
# PayRex Configuration (GCash Payment Gateway)
# Get these from your PayRex dashboard: https://dashboard.payrex.co
PAYREX_SECRET_KEY=sk_live_your_secret_key_here
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=pk_live_your_public_key_here
PAYREX_WEBHOOK_SECRET=your_payrex_webhook_secret_here

# Application URL for payment redirects
# Update this to match your deployment URL in production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Saleor Backend Configuration

Ask your Saleor backend team to register this payment gateway via the Saleor Admin API or Dashboard:

```graphql
mutation {
  paymentGatewayInitialize(gatewayId: "payrex-gateway") {
    gateway {
      id
      name
      isActive
    }
    errors {
      field
      message
    }
  }
}
```

**Gateway Details**:
- **ID**: `payrex-gateway`
- **Type**: Payment App
- **Initialization Data**: Empty `{}` (not needed)

### 3. PayRex Webhook Configuration

1. Go to https://dashboard.payrex.co → Webhooks
2. Click "Add Webhook"
3. Fill in:

| Field | Value |
|-------|-------|
| **Endpoint URL** | `http://localhost:3000/api/payrex/webhook` (dev) or `https://yourdomain.com/api/payrex/webhook` (prod) |
| **Events** | Select all payment events |
| **Active** | ✓ Checked |

4. Copy the **Webhook Secret** to `PAYREX_WEBHOOK_SECRET` in `.env.local`

## File Locations & Purposes

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| PayRex Component | `apps/storefront/src/checkout/sections/PaymentSection/PayRexDropIn/PayRexDropIn.tsx` | GCash payment button & flow | ✅ Created |
| PayRex Types | `apps/storefront/src/checkout/sections/PaymentSection/PayRexDropIn/types.ts` | TypeScript definitions | ✅ Created |
| Create Payment API | `apps/storefront/src/app/api/payrex/create-payment/route.ts` | Creates PayRex session | ✅ Created |
| Webhook Handler | `apps/storefront/src/app/api/payrex/webhook/route.ts` | Processes payment events | ✅ Created |
| Success Page | `apps/storefront/src/app/payment/success/page.tsx` | Payment success redirect | ✅ Created |
| Failed Page | `apps/storefront/src/app/payment/failed/page.tsx` | Payment failure redirect | ✅ Created |
| supportedPaymentApps | `apps/storefront/src/checkout/sections/PaymentSection/supportedPaymentApps.ts` | Map gateway to component | ✏️ Updated |
| Payment Types | `apps/storefront/src/checkout/sections/PaymentSection/types.ts` | Type definitions | ✏️ Updated |
| Payment Utils | `apps/storefront/src/checkout/sections/PaymentSection/utils.ts` | Gateway filtering | ✏️ Updated |
| Environment | `apps/storefront/.env.local` | Credentials | ✏️ Updated |

## Verification Steps

### ✅ Check 1: Files Exist

```bash
# Navigate to storefront
cd apps/storefront

# Check all files were created
ls -la src/app/api/payrex/create-payment/route.ts
ls -la src/app/api/payrex/webhook/route.ts
ls -la src/checkout/sections/PaymentSection/PayRexDropIn/
ls -la src/app/payment/success/page.tsx
ls -la src/app/payment/failed/page.tsx
```

### ✅ Check 2: Environment Variables Set

```bash
# Check variables are in .env.local
grep PAYREX_SECRET_KEY .env.local
grep NEXT_PUBLIC_PAYREX_PUBLIC_KEY .env.local
grep PAYREX_WEBHOOK_SECRET .env.local
grep NEXT_PUBLIC_APP_URL .env.local
```

**Expected Output**: Lines with your actual values (not "here" placeholders)

### ✅ Check 3: Imports Work

```bash
# Check TypeScript syntax (runs type checker)
cd apps/storefront
pnpm exec tsc --noEmit

# Should complete without errors
```

### ✅ Check 4: Dev Server Starts

```bash
# Start dev server
pnpm dev

# Wait for:
# - Local: http://localhost:3000
# - Ready in 2.3s
```

### ✅ Check 5: Payment Button Visible

1. Open http://localhost:3000 in browser
2. Navigate to checkout
3. Look for **"Pay with GCash"** button
4. Should show blue button with payment icon

**If not visible**:
- Verify PayRex gateway registered in Saleor
- Check browser console for errors
- Verify `.env.local` has all PayRex variables

## Test Payment Flow

### 1. Prepare Test Environment

```bash
# Set variables for test mode (if PayRex offers it)
# Dev server should be running: pnpm dev
```

### 2. Complete Test Payment

1. Go to checkout page
2. Fill in customer info (name, email, address)
3. Click **"Pay with GCash"** button
4. You'll be redirected to PayRex test checkout
5. Use test card: `4111 1111 1111 1111`
6. Any future date for expiry
7. Any CVC (e.g., 123)

### 3. Verify Success

After payment:
- [ ] Redirected to `/payment/success` page
- [ ] Success message displays
- [ ] Order shows in Saleor dashboard
- [ ] Webhook notification logged (check server console)

### 4. Test Failure (Optional)

PayRex dashboard has "Send Test Event" to simulate failed payment:
1. Go to PayRex Dashboard → Webhooks → Test Events
2. Send `checkout_session.payment_failed` event
3. Check server logs for webhook processing

## Troubleshooting

### Issue: "Cannot find module"

```
Error: Cannot find module '@/checkout/sections/PaymentSection/PayRexDropIn/PayRexDropIn'
```

**Solution**:
- Ensure all PayRex files exist
- Check file paths match exactly
- Run `pnpm install` to ensure deps
- Restart dev server: `pnpm dev`

### Issue: "Missing PayRex configuration"

```
Error: Missing PayRex configuration (HTTP 500)
```

**Solution**:
- Check `.env.local` has all PayRex vars
- Restart dev server after updating `.env.local`
- Verify no typos in variable names

### Issue: Cannot redirect to PayRex

```
No checkout URL returned from payment server
```

**Solution**:
- Verify `PAYREX_SECRET_KEY` is correct
- Check PayRex API is reachable (no firewall)
- Review server logs for PayRex API error response

### Issue: "Invalid signature" on webhook

```
Error: Invalid signature
```

**Solution**:
- Verify `PAYREX_WEBHOOK_SECRET` matches PayRex dashboard
- Ensure webhook URL in PayRex matches your app
- Try sending test event from PayRex dashboard

## Quick Reference: API Endpoints

### Frontend Component Calls

```typescript
// 1. When user clicks "Pay with GCash"
const response = await fetch("/api/payrex/create-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    orderId, checkoutId, amount, currency, 
    customerEmail, customerName, description,
    successUrl, failureUrl
  })
});

// 2. PayRex redirects user to PayRex checkout URL
window.location.href = response.json().checkoutUrl;

// 3. User completes payment on PayRex
// 4. PayRex redirects to /payment/success or /payment/failed

// 5. PayRex sends webhook (async, in background)
// POST /api/payrex/webhook
```

## Deployment Checklist

### Before Going Live

- [ ] All 9 files created/modified (check Files & Purposes table)
- [ ] PayRex credentials set in environment (not hardcoded)
- [ ] Webhook URL configured in PayRex dashboard
- [ ] Gateway registered in Saleor
- [ ] Test payment completed successfully
- [ ] Success and failure pages display correctly
- [ ] Order metadata contains payment status
- [ ] Error handling tested (disconnect, cancel, fail)

### Environment Variables for Production

```bash
# Update these with LIVE PayRex keys (not test keys!)
PAYREX_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=pk_live_your_live_public_key
PAYREX_WEBHOOK_SECRET=whsec_your_live_secret

# Update to your production domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment Platforms

**Railway**:
```bash
railway link
railway variables
# Add PAYREX_* and NEXT_PUBLIC_APP_URL
railway deploy
```

**Render**:
```bash
# Add environment variables in Render dashboard
# Deploy via Git push or Render CLI
```

**Vercel**:
```bash
# Add environment variables in Vercel dashboard
# Deploy via `vercel --prod`
```

**Self-hosted**:
```bash
# Add to your .env or docker-compose.yml
# Build and start: pnpm build && pnpm start
```

## Documentation

For detailed information, see:
- **`PAYREX_QUICKSTART.md`** - 5-minute setup guide
- **`PAYREX_INTEGRATION.md`** - Complete reference (5000+ words)
- **`PAYREX_FILES_REFERENCE.md`** - All files listed with full details

## Support

If you encounter issues:

1. **Check logs**: `pnpm dev` in terminal shows errors
2. **Verify config**: `.env.local` has all required variables
3. **Test endpoint**: `curl http://localhost:3000/api/payrex/webhook` (POST)
4. **Review docs**: See links above
5. **PayRex support**: https://support.payrex.co

---

**Ready to activate PayRex!** Follow these steps and you'll have GCash payments working in minutes.
