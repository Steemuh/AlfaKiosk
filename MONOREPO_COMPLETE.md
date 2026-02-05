# Railway Deployment Guide

## ✅ Monorepo Migration Complete!

Both apps build successfully and are ready for deployment.

## 📦 What Was Done

1. ✅ Created PNPM workspace monorepo structure
2. ✅ Separated storefront (customer) and cashier apps
3. ✅ Extracted shared code to `packages/shared`
4. ✅ Updated all import paths
5. ✅ Both apps build successfully

## 🚀 Railway Deployment

### App 1: Storefront (Customer App)

**Service Settings:**
- **Root Directory**: `apps/storefront`
- **Build Command**: `cd ../.. && pnpm install && pnpm generate && cd apps/storefront && pnpm build`
- **Start Command**: `pnpm start`
- **Watch Paths**: `apps/storefront/**, packages/shared/**`

**Environment Variables:**
```
NEXT_PUBLIC_SALEOR_API_URL=<your-saleor-endpoint>
NEXT_PUBLIC_STOREFRONT_URL=<your-storefront-url>
```

### App 2: Cashier Dashboard

**Service Settings:**
- **Root Directory**: `apps/cashier`
- **Build Command**: `cd ../.. && pnpm install && pnpm generate && cd apps/cashier && pnpm build`
- **Start Command**: `pnpm start`
- **Watch Paths**: `apps/cashier/**, packages/shared/**`

**Environment Variables:**
```
NEXT_PUBLIC_SALEOR_API_URL=<your-saleor-endpoint>
```

## 🧪 Local Development

```bash
# Install all dependencies
pnpm install

# Generate GraphQL types
pnpm generate

# Run storefront (port 3000)
pnpm dev:storefront

# Run cashier (port 3001)
pnpm dev:cashier

# Build both apps
pnpm build
```

## 📁 Final Structure

```
storefront/
├── apps/
│   ├── storefront/        # Customer app (port 3000)
│   └── cashier/           # Cashier dashboard (port 3001)
├── packages/
│   └── shared/            # Shared GraphQL, utilities, UI
├── pnpm-workspace.yaml
├── package.json
└── .graphqlrc.ts
```

## ✨ Key Benefits

- ✅ Complete separation of customer and cashier apps
- ✅ No role switching - clean authentication boundaries
- ✅ Shared GraphQL types and utilities
- ✅ Independent deployments
- ✅ Type-safe imports via TypeScript path aliases
