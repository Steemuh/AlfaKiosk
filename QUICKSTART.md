# Alfamart Food Kiosk - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd storefront
pnpm install
```

### Step 2: Configure Environment
Make sure you have these in your `.env.local`:
```
NEXT_PUBLIC_SALEOR_API_URL=https://your-saleor-instance/graphql/
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3000
```

### Step 3: Run Development Server
```bash
pnpm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Kiosk App Flow

```
User QR Scans → Home Page with Products
     ↓
Select Food Items & Add to Cart
     ↓
Click "Checkout"
     ↓
Review Order Summary
     ↓
Enter Payment Info (Stripe/Adyen)
     ↓
Order Confirmation with Receipt
```

---

## 🛠️ What's Been Simplified

### Removed ✂️
- User login/registration
- Order history page
- Customer account management
- Address book
- Shipping method selection
- Multi-currency selector
- Draft mode notifications

### Kept ✅
- Product catalog with categories
- Shopping cart
- Payment processing (Stripe/Adyen)
- Order confirmation
- Clean, mobile-friendly UI with Tailwind CSS

---

## 🎯 Next: Customize for Your Canteen

### 1. Add Food Products
1. Go to your Saleor Admin Panel
2. Create products in these categories:
   - Viands (Meats, Rice dishes, etc.)
   - Beverages (Coffee, Juices, Water)
   - Desserts (Pastries, Fruits)
   - Others

### 2. Add QR Code Scanner
```bash
pnpm add @zxing/browser
```

Example integration point: `src/app/[channel]/(main)/page.tsx`

### 3. Connect Payment Gateway
- Stripe: Already configured in the code
- Adyen: Already configured in the code
- Configure your API keys in environment variables

### 4. Customize Branding
- Update colors in `tailwind.config.ts`
- Change logos in `public/` folder
- Update text in component files

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| `src/checkout/sections/KioskCheckoutForm/` | **NEW** - Simplified payment-only checkout |
| `src/checkout/sections/PaymentSection/` | Payment form (Stripe/Adyen) |
| `src/checkout/sections/Summary/` | Order summary display |
| `src/ui/components/ProductList.tsx` | Product grid display |
| `src/app/[channel]/(main)/page.tsx` | Home page with featured products |
| `src/app/[channel]/(main)/cart/` | Shopping cart page |

---

## 🔑 Key Hooks & Utilities

```tsx
// Get checkout/cart data
import { useCheckout } from "@/checkout/hooks/useCheckout";
const { checkout, lines } = useCheckout();

// Execute GraphQL queries
import { executeGraphQL } from "@/lib/graphql";
const data = await executeGraphQL(ProductListDocument, { variables });

// Component examples
import { ProductList } from "@/ui/components/ProductList";
import { Summary } from "@/checkout/sections/Summary";
```

---

## 📋 Recommended Features to Add

1. **QR Code Scanner** - Identify canteen/location
2. **Order Number Display** - Prominent in confirmation
3. **Estimated Pickup Time** - Instead of shipping
4. **Receipt Print Option** - Kiosk receipt printer
5. **Sound/Visual Alerts** - Order ready notification
6. **Kiosk Mode Styling** - Large touch-friendly buttons
7. **Auto-logout** - Return to home after timeout

---

## 🧪 Testing the App

### Test the Product Page
- [http://localhost:3000/](http://localhost:3000/)

### Test the Cart
- [http://localhost:3000/cart](http://localhost:3000/cart)

### Test the Checkout
- Add items to cart, then proceed to checkout
- Full URL: [http://localhost:3000/checkout?checkout=YOUR_CHECKOUT_ID](http://localhost:3000/checkout?checkout=YOUR_CHECKOUT_ID)

---

## 🐛 Troubleshooting

### "Missing NEXT_PUBLIC_SALEOR_API_URL"
- Add environment variable to `.env.local`

### "Products not loading"
- Check Saleor API connection
- Verify products exist in Saleor Admin

### "Checkout not working"
- Make sure you have a valid checkout ID
- Check payment gateway configuration

### Build Errors
```bash
# Clear build cache and try again
rm -rf .next
pnpm run dev
```

---

## 📞 Need Help?

- **Saleor Docs:** https://docs.saleor.io/
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs
- **Tailwind Docs:** https://tailwindcss.com/docs

---

**Last Updated:** January 6, 2026  
**Version:** 1.0 (Simplified for Food Kiosk)
