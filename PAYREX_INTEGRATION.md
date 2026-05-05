# PayRex GCash Payment Integration Guide

## Overview

This guide explains how to integrate PayRex GCash payment into your Saleor storefront. PayRex provides a secure, hosted checkout experience for GCash payments in the Philippines.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Customer Browser                          │
└──────────────┬──────────────────────────────────────────────────┘
               │
        ┌──────▼──────┐
        │   Checkout  │
        │   (Frontend)│
        └──────┬──────┘
               │
      ┌────────▼────────┐
      │ Select Payment  │
      │ (GCash/PayRex)  │
      └────────┬────────┘
               │
      ┌────────▼──────────────────────────────────────────┐
      │ Next.js API Route: /api/payrex/create-payment     │
      │ - Validates request                               │
      │ - Calls PayRex API (secure, server-side)          │
      │ - Returns checkout URL                            │
      └────────┬──────────────────────────────────────────┘
               │
      ┌────────▼──────────────┐
      │   PayRex Hosted       │
      │   Checkout (GCash)    │
      │   - User completes    │
      │     payment via GCash │
      │   - PayRex redirects  │
      │     to success/failed │
      └────────┬──────────────┘
               │
      ┌────────▼──────────────────────────────────┐
      │ PayRex Webhook (async)                    │
      │ - Receives payment status                 │
      │ - Updates Saleor order metadata           │
      │ - Marks order as paid (via metadata)      │
      └─────────────────────────────────────────┘
```

## File Structure

```
apps/storefront/
├── src/
│   ├── app/
│   │   ├── api/payrex/
│   │   │   ├── create-payment/route.ts    # POST endpoint for creating PayRex session
│   │   │   └── webhook/route.ts           # POST endpoint for PayRex webhooks
│   │   └── payment/
│   │       ├── success/page.tsx           # Success redirect page
│   │       └── failed/page.tsx            # Failure redirect page
│   └── checkout/
│       └── sections/PaymentSection/
│           ├── PayRexDropIn/
│           │   ├── PayRexDropIn.tsx       # PayRex payment component
│           │   └── types.ts               # PayRex TypeScript types
│           ├── supportedPaymentApps.ts    # Updated to include PayRex
│           ├── types.ts                   # Updated type definitions
│           └── utils.ts                   # Updated gateway list
└── .env.local                             # Updated with PayRex credentials
```

## Setup Instructions

### 1. Get PayRex Credentials

1. Visit [PayRex Dashboard](https://dashboard.payrex.co)
2. Create an account or log in
3. Navigate to **Settings** → **API Keys**
4. Copy your:
   - **Secret Key** (keep this secure, never expose in frontend)
   - **Public Key** (can be exposed to frontend as prefixed with `NEXT_PUBLIC_`)
   - **Webhook Secret** (for verifying webhook signatures)

### 2. Update Environment Variables

Edit `.env.local` in `apps/storefront/`:

```bash
# PayRex Configuration
PAYREX_SECRET_KEY=sk_live_your_secret_key_here
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=pk_live_your_public_key_here
PAYREX_WEBHOOK_SECRET=your_webhook_secret_here

# Application URL (critical for payment redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Dev
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Production
```

### 3. Configure PayRex Webhook

1. Go to PayRex Dashboard → **Webhooks**
2. Add a new webhook with:
   - **URL**: `{YOUR_APP_URL}/api/payrex/webhook`
   - **Events**: Select `payment.succeeded`, `payment.failed`, `checkout_session.expired`
   - **Secret**: Copy the webhook secret to your `.env.local`

### 4. Register PayRex Payment Gateway in Saleor

You need to configure PayRex as a payment gateway in your Saleor backend. This depends on your Saleor setup:

#### Option A: Using Saleor Payment Apps (Recommended)

If your Saleor instance supports payment apps:
1. Create a payment app that returns `payrex-gateway` as the payment gateway ID
2. The app should initialize with empty data (PayRex doesn't need initialization payload)

#### Option B: Manual Configuration

If you have direct access to your Saleor backend, configure the payment gateway directly:

```graphql
mutation {
  paymentGatewayInitialize(gatewayId: "payrex-gateway") {
    gateway {
      id
      name
      isActive
    }
  }
}
```

### 5. Verify Installation

1. **Check Environment Variables**:
   ```bash
   # From apps/storefront directory
   echo $PAYREX_SECRET_KEY  # Should not be empty
   echo $NEXT_PUBLIC_PAYREX_PUBLIC_KEY  # Should not be empty
   ```

2. **Start Development Server**:
   ```bash
   cd apps/storefront
   pnpm dev
   ```

3. **Test Payment Flow**:
   - Go to checkout page
   - You should see "Pay with GCash" option
   - Select GCash and proceed
   - Should redirect to PayRex hosted checkout
   - Complete a test payment (PayRex provides test cards)

## Payment Flow Details

### Frontend Flow (PayRexDropIn Component)

1. User fills checkout form with:
   - Customer name
   - Email
   - Address
   - Total amount

2. User clicks "Pay with GCash"

3. `PayRexDropIn.tsx` component:
   - Validates checkout data
   - Calls `/api/payrex/create-payment` with order details
   - Receives checkout URL from server
   - Calls `onCheckoutComplete()` to create order in Saleor
   - Redirects user to PayRex checkout URL

### Server Flow (API Routes)

#### `/api/payrex/create-payment` - POST

**Request**:
```typescript
{
  orderId: string;           // Checkout ID from Saleor
  checkoutId: string;        // Same as orderId
  amount: number;            // In PHP pesos
  currency: string;          // "PHP"
  customerEmail: string;     // Customer email
  customerName: string;      // Customer name
  description: string;       // Order description
  successUrl: string;        // Redirect on success
  failureUrl: string;        // Redirect on failure
}
```

**Response**:
```typescript
{
  success: boolean;
  checkoutUrl: string;       // URL to send user to
  sessionId: string;         // PayRex session ID
}
```

**Security**:
- `PAYREX_SECRET_KEY` stays on server (never exposed)
- Calls PayRex API securely
- Validates all inputs
- Returns only public information to frontend

#### `/api/payrex/webhook` - POST

**Receives**:
- Payment succeeded event
- Payment failed event
- Checkout session expired event

**Actions**:
- Verifies webhook signature using `PAYREX_WEBHOOK_SECRET`
- Updates Saleor order metadata with payment status
- Marks order as paid (via metadata key `payrex_payment_status`)

**Metadata Updated**:
```
payrex_payment_id: "ch_xxx"        # PayRex charge/session ID
payrex_payment_status: "succeeded" # Payment result
payrex_payment_method: "gcash"     # Payment method type
```

### Payment Status Pages

**Success Page**: `/payment/success`
- Shows success message
- Displays order confirmation
- Links to home or orders page
- Shows session ID for reference

**Failure Page**: `/payment/failed`
- Explains payment was not processed
- Provides troubleshooting steps
- Allows retry via checkout link
- Shows support contact info

## Testing

### Test Mode

PayRex provides test cards for development:

1. In **Test Mode** (check PayRex dashboard):
   - Use test card: `4111 1111 1111 1111`
   - Any future expiry date
   - Any CVC

2. **Webhook Testing**:
   - PayRex dashboard has a "Send Test Event" feature
   - Use it to verify webhook endpoint is working
   - Check server logs for webhook processing

### Local Testing

```bash
# Terminal 1: Start storefront
cd apps/storefront
pnpm dev

# Terminal 2: Test webhook (after deploying to public URL)
curl -X POST http://localhost:3000/api/payrex/webhook \
  -H "Content-Type: application/json" \
  -H "x-payrex-signature: test_signature" \
  -d '{
    "type": "checkout_session.payment_succeeded",
    "data": {
      "id": "session_123",
      "status": "succeeded",
      "reference": "checkout_456",
      "amount": 50000,
      "currency": "PHP",
      "metadata": {
        "order_id": "checkout_456",
        "customer_email": "test@example.com"
      }
    }
  }'
```

## Production Deployment

### 1. Environment Variables

Update in your hosting provider (Railway, Render, Vercel, etc.):

```
PAYREX_SECRET_KEY=sk_live_xxx          # Use LIVE keys
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=pk_live_xxx
PAYREX_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Webhook Configuration

1. Update PayRex webhook URL to your production domain:
   ```
   https://yourdomain.com/api/payrex/webhook
   ```

2. Use **Live** keys (not test keys)

### 3. Test in Live Mode

1. Use real GCash account or test account provided by PayRex
2. Process small test transaction
3. Verify order appears in Saleor
4. Check webhook received payment notification

## Troubleshooting

### Issue: "Payment gateway configuration incomplete"

**Cause**: Missing `PAYREX_SECRET_KEY` or `NEXT_PUBLIC_PAYREX_PUBLIC_KEY`

**Solution**:
- Check `.env.local` has both keys
- Restart dev server: `pnpm dev`
- Verify keys from PayRex dashboard

### Issue: Redirect to PayRex not working

**Cause**: `NEXT_PUBLIC_APP_URL` not set correctly

**Solution**:
- Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` (for dev)
- Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com` (for production)
- Restart dev server

### Issue: Webhook not being processed

**Cause**: Webhook URL not accessible or signature verification failing

**Solution**:
- Ensure webhook URL is publicly accessible
- For local testing, use a tunneling service (ngrok, exposé)
- Verify `PAYREX_WEBHOOK_SECRET` matches PayRex dashboard
- Check server logs: `console.error` in `webhook/route.ts`

### Issue: Order not created after payment

**Cause**: `onCheckoutComplete()` called after redirect (too late)

**Note**: Current implementation calls `onCheckoutComplete()` BEFORE redirecting to PayRex. Order exists immediately after payment confirmation.

## Order Status in Saleor

After payment succeeds, order metadata will contain:

```graphql
query {
  order(id: "order_id") {
    id
    number
    metadata {
      key: "payrex_payment_status"
      value: "succeeded"
    }
    metadata {
      key: "payrex_payment_id"
      value: "ch_xxxx"
    }
  }
}
```

You can query this to check if order was paid via PayRex.

## Integration with Existing Payment Methods

PayRex works alongside existing payment methods:
- **Adyen**: Still available if configured
- **Stripe**: Still available if configured
- **Dummy**: Still available for testing
- **Cash**: Can be used as fallback

The storefront will show all configured payment methods. Users can choose their preferred method.

## Security Best Practices

1. **Never commit credentials**:
   - Add `.env.local` to `.gitignore`
   - Use environment variables in production

2. **Secret Key Protection**:
   - `PAYREX_SECRET_KEY` only on server
   - Never expose in frontend code

3. **Webhook Verification**:
   - Always verify webhook signature
   - Check `x-payrex-signature` header

4. **HTTPS Only**:
   - Use HTTPS for production webhook URL
   - PayRex won't send to HTTP (except localhost)

5. **Input Validation**:
   - Validate amount matches checkout
   - Validate customer email format
   - Validate checkout exists in Saleor

## API Reference

### PayRex Endpoints Used

**Create Checkout Session**:
```
POST https://api.payrex.co/v1/checkout_sessions
Authorization: Bearer {PAYREX_SECRET_KEY}
Content-Type: application/json
```

**Webhook Events Supported**:
- `checkout_session.payment_succeeded`
- `checkout_session.payment_failed`
- `checkout_session.expired`

## Support

For issues:
1. Check PayRex API documentation: https://docs.payrex.co
2. Review error logs in server console
3. Test webhook locally with curl
4. Check PayRex dashboard for test events

## Rollback

If you need to remove PayRex integration:

1. Comment out PayRex import in `supportedPaymentApps.ts`
2. Remove PayRex from `paymentMethodToComponent` mapping
3. Remove PayRex from `PaymentGatewayId` type
4. Remove API routes (or keep them, they won't be used)
5. Redeploy

Orders already created will keep their metadata intact.
