# PayRex Integration - Quick Start

## Files Created/Modified

### New Files Created:

1. **API Routes** (Server-side, `PAYREX_SECRET_KEY` is safe):
   - `apps/storefront/src/app/api/payrex/create-payment/route.ts` - Creates PayRex checkout session
   - `apps/storefront/src/app/api/payrex/webhook/route.ts` - Handles PayRex webhook events

2. **Payment Component** (Frontend):
   - `apps/storefront/src/checkout/sections/PaymentSection/PayRexDropIn/PayRexDropIn.tsx` - GCash payment UI
   - `apps/storefront/src/checkout/sections/PaymentSection/PayRexDropIn/types.ts` - TypeScript types

3. **Redirect Pages**:
   - `apps/storefront/src/app/payment/success/page.tsx` - Payment success page
   - `apps/storefront/src/app/payment/failed/page.tsx` - Payment failure page

4. **Configuration**:
   - `.env.local` - Updated with PayRex credentials

5. **Documentation**:
   - `PAYREX_INTEGRATION.md` - Complete integration guide
   - `PAYREX_QUICKSTART.md` - This file

### Modified Files:

1. `apps/storefront/src/checkout/sections/PaymentSection/supportedPaymentApps.ts` - Added PayRex mapping
2. `apps/storefront/src/checkout/sections/PaymentSection/types.ts` - Added PayRex gateway types
3. `apps/storefront/src/checkout/sections/PaymentSection/utils.ts` - Added PayRex to supported gateways
4. `.env.local` - Added PayRex environment variables

## 5-Minute Setup

### Step 1: Add Credentials to `.env.local`

```bash
# apps/storefront/.env.local
PAYREX_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=pk_live_your_key
PAYREX_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Restart Dev Server

```bash
cd apps/storefront
pnpm dev
```

### Step 3: Register PayRex Gateway in Saleor

Contact your Saleor admin or backend team to register `payrex-gateway` as a payment gateway.

### Step 4: Test

1. Go to checkout page
2. Look for "Pay with GCash" button
3. Click and complete test payment
4. Should redirect to success page

## How It Works

```
User Flow:
1. Customer selects "Pay with GCash" → PayRexDropIn component
2. Clicks "Pay with GCash" button
3. Component calls /api/payrex/create-payment (server)
4. Server creates PayRex session securely (PAYREX_SECRET_KEY hidden)
5. Server returns checkout URL
6. Component completes Saleor checkout (creates order)
7. Component redirects to PayRex checkout URL
8. User completes GCash payment on PayRex
9. PayRex redirects back to /payment/success or /payment/failed
10. PayRex sends webhook to /api/payrex/webhook
11. Webhook updates Saleor order metadata with payment status
```

## Key Security Features

✅ **PAYREX_SECRET_KEY never exposed to browser**
- Only used in server-side API route
- Cannot be accessed from frontend code

✅ **Webhook signature verification**
- Verifies all webhooks with `PAYREX_WEBHOOK_SECRET`
- Rejects tampered or fake webhooks

✅ **Input validation**
- Amount validated
- Email validated
- Checkout existence checked

✅ **Secure redirect**
- PayRex holds secure checkout
- User never sends card data to your server

## Testing Checklist

- [ ] Environment variables set in `.env.local`
- [ ] Dev server started: `pnpm dev`
- [ ] Can see "Pay with GCash" button on checkout
- [ ] Can click button without errors
- [ ] Gets redirected to PayRex (or test mode)
- [ ] Can complete test payment (use test card `4111 1111 1111 1111`)
- [ ] Gets redirected to success page
- [ ] Webhook processed (check console logs)
- [ ] Order metadata contains `payrex_payment_status=succeeded`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/payrex/create-payment` | Create PayRex checkout session |
| POST | `/api/payrex/webhook` | Receive payment status from PayRex |
| GET | `/payment/success` | Success redirect page |
| GET | `/payment/failed` | Failure redirect page |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Button not showing | Ensure PayRex gateway registered in Saleor |
| Redirect loop | Check `NEXT_PUBLIC_APP_URL` is correct |
| Webhook failing | Verify `PAYREX_WEBHOOK_SECRET` matches PayRex dashboard |
| Order not created | Check browser console for errors |

## Next Steps

1. **Setup PayRex Account**: https://payrex.co
2. **Get API Keys**: PayRex Dashboard → Settings → API Keys
3. **Configure Webhook**: PayRex Dashboard → Webhooks → Add Endpoint
4. **Register Gateway**: Ask backend team to register `payrex-gateway` in Saleor
5. **Test**: Follow testing checklist above
6. **Deploy**: Update environment variables in production

## Code References

- **Component**: [PayRexDropIn.tsx](apps/storefront/src/checkout/sections/PaymentSection/PayRexDropIn/PayRexDropIn.tsx)
- **Payment API**: [create-payment/route.ts](apps/storefront/src/app/api/payrex/create-payment/route.ts)
- **Webhook API**: [webhook/route.ts](apps/storefront/src/app/api/payrex/webhook/route.ts)
- **Types**: [PayRexDropIn/types.ts](apps/storefront/src/checkout/sections/PaymentSection/PayRexDropIn/types.ts)
- **Success Page**: [payment/success/page.tsx](apps/storefront/src/app/payment/success/page.tsx)
- **Failure Page**: [payment/failed/page.tsx](apps/storefront/src/app/payment/failed/page.tsx)

---

For detailed information, see [PAYREX_INTEGRATION.md](PAYREX_INTEGRATION.md)
