# Railway Deployment Configuration

## Deployment Setup

This monorepo contains two separate Next.js applications that should be deployed independently on Railway.

### App 1: Customer Storefront

**Service Name:** `saleor-storefront`

**Settings:**
- **Root Directory:** `apps/storefront`
- **Build Command:** `cd ../.. && pnpm install && pnpm generate && cd apps/storefront && pnpm build`
- **Start Command:** `pnpm start`
- **Watch Paths:** `apps/storefront/**, packages/shared/**`

**Environment Variables:**
```
NEXT_PUBLIC_SALEOR_API_URL=<your-saleor-graphql-endpoint>
NEXT_PUBLIC_STOREFRONT_URL=<your-storefront-url>
# Add other required environment variables
```

### App 2: Cashier Dashboard

**Service Name:** `saleor-cashier`

**Settings:**
- **Root Directory:** `apps/cashier`
- **Build Command:** `cd ../.. && pnpm install && pnpm generate && cd apps/cashier && pnpm build`
- **Start Command:** `pnpm start`
- **Watch Paths:** `apps/cashier/**, packages/shared/**`

**Environment Variables:**
```
NEXT_PUBLIC_SALEOR_API_URL=<your-saleor-graphql-endpoint>
# Add other required environment variables
```

## Important Notes

1. Both apps share GraphQL types generated from `packages/shared`
2. GraphQL codegen runs at the root level before each build
3. Both apps must be deployed separately as independent Railway services
4. Changes to `packages/shared` will trigger rebuilds for both apps (if watch paths configured)

## Local Development

```bash
# Install dependencies
pnpm install

# Generate GraphQL types (run from root)
pnpm generate

# Run storefront
pnpm dev:storefront

# Run cashier (in separate terminal)
pnpm dev:cashier

# Build both apps
pnpm build
```
