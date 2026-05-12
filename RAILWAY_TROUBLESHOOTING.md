# Railway Deployment - Orders API Debugging Guide

## Issue: Orders Tab Cannot Fetch Orders (500 Error)

The Orders API returns 500 errors when deployed on Railway. This is typically caused by missing or incorrect environment variables.

---

## Root Cause

Both the **Cashier** and **Storefront** apps need these critical environment variables to connect to your Saleor backend:

1. **`SALEOR_API_URL`** - Saleor GraphQL API endpoint
2. **`SALEOR_APP_TOKEN`** - Authentication token for Saleor API
3. **`DEFAULT_CHANNEL`** - Saleor channel slug (e.g., `ph-kiosk`)

If these are missing or incorrect, the API routes (`/api/orders`) return 500 errors.

---

## Quick Fix: Set Environment Variables on Railway

### Step 1: Access Railway Dashboard
1. Go to https://railway.app
2. Open your project
3. Click on the **Storefront** service

### Step 2: Set Variables for Storefront

Click **Variables** tab and add:

| Variable | Value | Example |
|----------|-------|---------|
| `SALEOR_API_URL` | Your Saleor GraphQL endpoint | `https://your-saleor-instance.com/graphql/` |
| `SALEOR_APP_TOKEN` | Saleor app authentication token | `<64-char token>` |
| `DEFAULT_CHANNEL` | Saleor channel slug | `ph-kiosk` |
| `NEXT_PUBLIC_DEFAULT_CHANNEL` | Same as DEFAULT_CHANNEL | `ph-kiosk` |
| `NEXT_PUBLIC_SALEOR_API_URL` | Same as SALEOR_API_URL | `https://your-saleor-instance.com/graphql/` |

### Step 3: Set Variables for Cashier

Repeat the same for the **Cashier** service:
- Same `SALEOR_API_URL`
- Same `SALEOR_APP_TOKEN`
- Same `DEFAULT_CHANNEL`

### Step 4: Redeploy

Push a new commit or manually trigger a redeploy on Railway:
```bash
git commit --allow-empty -m "Redeploy with env variables"
git push
```

---

## How to Find Your Saleor Credentials

### Find Your Saleor API URL:
1. Log into your Saleor admin dashboard
2. Look in the address bar: `https://your-saleor-instance.com/dashboard`
3. Your GraphQL endpoint is: `https://your-saleor-instance.com/graphql/`

### Find Your Saleor App Token:
1. Saleor admin dashboard → **Apps** (or **Extensions** → **Apps**)
2. Find or create an app for your storefront
3. Generate/copy the **Auth Token**
4. Paste it into Railway as `SALEOR_APP_TOKEN`

### Find Your Channel Slug:
1. Saleor admin dashboard → **Configuration** → **Channels**
2. Find your channel and note its **Slug** (e.g., `ph-kiosk`)

---

## Debugging: Check Server Logs

After deploying, the server will log detailed debug info:

### In Railway Console:
1. Open your **Storefront** or **Cashier** service
2. Click **Logs** tab
3. Search for `[cashier/api/orders]` or `[storefront/api/orders]`

### Expected Success Log:
```
[cashier/api/orders] Starting request...
[cashier/api/orders] SALEOR_API_URL: ✓ set
[cashier/api/orders] SALEOR_APP_TOKEN: ✓ set
[cashier/api/orders] DEFAULT_CHANNEL: ph-kiosk
[cashier/api/orders] Fetching from Saleor: https://your-saleor.com/graphql/
[cashier/api/orders] Saleor response status: 200
[cashier/api/orders] Found 5 orders from Saleor
[cashier/api/orders] Filtering: 5 total orders, 3 paid
```

### Error Logs to Look For:

**Missing Environment Variable:**
```
[cashier/api/orders] SALEOR_API_URL: ✗ MISSING
```
→ Add `SALEOR_API_URL` to Railway variables

**Saleor GraphQL Error (e.g., 401 Unauthorized):**
```
[cashier/api/orders] Saleor GraphQL error: [{ message: "Invalid token" }]
```
→ Check your `SALEOR_APP_TOKEN` is correct

**Saleor HTTP 500 Error:**
```
[cashier/api/orders] Saleor HTTP error: 500 { error: "... some error ..." }
```
→ Check your Saleor instance is running; there may be a backend issue

---

## Verify Orders Are Being Filtered

Both APIs filter orders to show only **paid** orders:
```typescript
const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
```

So ensure your test orders have `paymentStatus: "paid"` in the Saleor metadata.

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 error from `/api/orders` | Missing `SALEOR_API_URL` | Add env var to Railway |
| 401/403 from Saleor | Wrong or expired `SALEOR_APP_TOKEN` | Generate new token in Saleor admin |
| No orders returned | All orders are unpaid | Check order metadata: `paymentStatus` should be `"paid"` |
| CORS/Network error | Saleor endpoint unreachable | Verify `SALEOR_API_URL` is correct and publicly accessible |
| Channel not found | Wrong `DEFAULT_CHANNEL` slug | Check exact spelling in Saleor admin |

---

## Full Environment Variable Checklist

Use this as a reference when setting up Railway:

**Storefront Service Variables:**
- [ ] `SALEOR_API_URL` = `https://your-saleor-instance.com/graphql/`
- [ ] `SALEOR_APP_TOKEN` = `<token>`
- [ ] `DEFAULT_CHANNEL` = `ph-kiosk`
- [ ] `NEXT_PUBLIC_DEFAULT_CHANNEL` = `ph-kiosk`
- [ ] `NEXT_PUBLIC_SALEOR_API_URL` = `https://your-saleor-instance.com/graphql/`

**Cashier Service Variables:**
- [ ] `SALEOR_API_URL` = `https://your-saleor-instance.com/graphql/`
- [ ] `SALEOR_APP_TOKEN` = `<token>`
- [ ] `DEFAULT_CHANNEL` = `ph-kiosk`
- [ ] `NEXT_PUBLIC_DEFAULT_CHANNEL` = `ph-kiosk`
- [ ] `NEXT_PUBLIC_SALEOR_API_URL` = `https://your-saleor-instance.com/graphql/`

---

## Next Steps

1. **Set the environment variables** in Railway for both services
2. **Redeploy** (commit + push or manual trigger)
3. **Check the logs** in Railway console for success messages
4. **Test** the Orders tab in the UI and verify orders appear
5. If still failing, **share the error logs** from Railway console for further debugging

