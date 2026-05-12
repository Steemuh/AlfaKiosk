import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SALEOR_API_URL =
  process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;

const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;
const DEFAULT_CHANNEL = process.env.DEFAULT_CHANNEL || process.env.NEXT_PUBLIC_DEFAULT_CHANNEL;

const SHOP_QUERY = /* GraphQL */ `
  query PopularTodayShop {
    shop {
      id
      metadata {
        key
        value
      }
    }
  }
`;

const UPDATE_METADATA_MUTATION = /* GraphQL */ `
  mutation UpdateShopMetadata($id: ID!, $input: [MetadataInput!]!) {
    updateMetadata(id: $id, input: $input) {
      item {
        metadata {
          key
          value
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const PRODUCTS_BY_IDS_QUERY = /* GraphQL */ `
  query PopularTodayProducts($ids: [ID!], $channel: String!) {
    products(first: 20, channel: $channel, filter: { ids: $ids }) {
      edges {
        node {
          id
          name
          slug
          thumbnail(size: 256, format: WEBP) {
            url
            alt
          }
        }
      }
    }
  }
`;

function fail(message: string, status = 500, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(extra ?? {}),
    },
    { status }
  );
}

function getMetadataValue(metadata: Array<{ key: string; value: string }> | undefined, key: string) {
  if (!metadata) {
    return null;
  }

  const match = metadata.find((entry) => entry.key === key);
  return match?.value ?? null;
}

function parsePopularIds(raw: string | null) {
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === "string");
    }
  } catch {
    return [];
  }

  return [];
}

async function fetchShop() {
  const response = await fetch(SALEOR_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
    },
    body: JSON.stringify({ query: SHOP_QUERY }),
    cache: "no-store",
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(parsed?.errors?.[0]?.message || "Saleor error");
  }

  if (parsed?.errors?.length) {
    throw new Error(parsed.errors[0]?.message || "Saleor error");
  }

  return parsed?.data?.shop as { id: string; metadata?: Array<{ key: string; value: string }> } | null;
}

async function fetchProductsByIds(ids: string[]) {
  if (!ids.length) {
    return [] as Array<{ id: string; name: string; slug: string; thumbnail?: { url?: string; alt?: string } | null }>;
  }

  const response = await fetch(SALEOR_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
    },
    body: JSON.stringify({
      query: PRODUCTS_BY_IDS_QUERY,
      variables: {
        ids,
        channel: DEFAULT_CHANNEL,
      },
    }),
    cache: "no-store",
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok || parsed?.errors?.length) {
    return [];
  }

  return parsed?.data?.products?.edges?.map((edge: any) => edge.node) ?? [];
}

export async function GET() {
  try {
    if (!SALEOR_API_URL) {
      return fail("Missing SALEOR_API_URL", 500);
    }

    if (!SALEOR_APP_TOKEN) {
      return fail("Missing SALEOR_APP_TOKEN", 500);
    }

    if (!DEFAULT_CHANNEL) {
      return fail("Missing DEFAULT_CHANNEL", 500);
    }

    const shop = await fetchShop();
    if (!shop?.id) {
      return fail("Missing shop id", 500);
    }

    const rawIds = getMetadataValue(shop.metadata, "popularTodayProductIds");
    const selectedIds = parsePopularIds(rawIds);
    const products = await fetchProductsByIds(selectedIds);

    return NextResponse.json(
      {
        ok: true,
        selectedIds,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return fail("Failed to load popular today", 500, { details: message });
  }
}

export async function POST(request: Request) {
  try {
    if (!SALEOR_API_URL) {
      return fail("Missing SALEOR_API_URL", 500);
    }

    if (!SALEOR_APP_TOKEN) {
      return fail("Missing SALEOR_APP_TOKEN", 500);
    }

    const body = (await request.json()) as { ids?: string[] };
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];

    const shop = await fetchShop();
    if (!shop?.id) {
      return fail("Missing shop id", 500);
    }

    const metadataInput = [
      { key: "popularTodayProductIds", value: JSON.stringify(ids) },
      { key: "popularTodayUpdatedAt", value: new Date().toISOString() },
    ];

    const response = await fetch(SALEOR_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
      },
      body: JSON.stringify({
        query: UPDATE_METADATA_MUTATION,
        variables: {
          id: shop.id,
          input: metadataInput,
        },
      }),
      cache: "no-store",
    });

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;

    if (!response.ok || parsed?.errors?.length) {
      return fail(parsed?.errors?.[0]?.message || "Saleor error", 502);
    }

    const updateErrors = parsed?.data?.updateMetadata?.errors ?? [];
    if (updateErrors.length > 0) {
      return fail("Saleor metadata update error", 400, { saleorErrors: updateErrors });
    }

    return NextResponse.json({ ok: true, ids }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return fail("Failed to update popular today", 500, { details: message });
  }
}
