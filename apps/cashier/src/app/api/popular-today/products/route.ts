import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SALEOR_API_URL =
  process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;

const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;
const DEFAULT_CHANNEL = process.env.DEFAULT_CHANNEL || process.env.NEXT_PUBLIC_DEFAULT_CHANNEL;

const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query PopularTodaySearch($search: String!, $channel: String!) {
    products(
      first: 50
      channel: $channel
      sortBy: { field: NAME, direction: ASC }
      filter: { search: $search }
    ) {
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

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    if (!search) {
      return NextResponse.json({ ok: true, products: [] }, { status: 200 });
    }

    const response = await fetch(SALEOR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
      },
      body: JSON.stringify({
        query: SEARCH_PRODUCTS_QUERY,
        variables: {
          search,
          channel: DEFAULT_CHANNEL,
        },
      }),
      cache: "no-store",
    });

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return fail(parsed?.errors?.[0]?.message || "Saleor error", 502);
    }

    if (parsed?.errors?.length) {
      return fail(parsed.errors[0]?.message || "Saleor error", 502);
    }

    const products = parsed?.data?.products?.edges?.map((edge: any) => edge.node) ?? [];

    return NextResponse.json({ ok: true, products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return fail("Failed to search products", 500, { details: message });
  }
}
