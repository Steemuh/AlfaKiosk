import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SALEOR_API_URL =
  process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;

const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;
const DEFAULT_CHANNEL = process.env.DEFAULT_CHANNEL || process.env.NEXT_PUBLIC_DEFAULT_CHANNEL;

const ORDERS_QUERY = /* GraphQL */ `
  query CashierOrders($channel: String!, $first: Int!) {
    orders(
      first: $first
      channel: $channel
      sortBy: { field: CREATED_AT, direction: DESC }
    ) {
      edges {
        node {
          id
          number
          created
          status
          total {
            gross {
              amount
              currency
            }
          }
          userEmail
          billingAddress {
            firstName
            lastName
          }
          channel {
            slug
          }
          lines {
            id
            productName
            variantName
            quantity
            unitPrice {
              gross {
                amount
                currency
              }
            }
          }
        }
      }
    }
  }
`;

type SaleorOrdersResponse = {
  data?: {
    orders?: {
      edges?: Array<{
        node: {
          id: string;
          number: string | null;
          created: string;
          status: string;
          userEmail: string | null;
          billingAddress?: {
            firstName?: string | null;
            lastName?: string | null;
          } | null;
          channel?: { slug?: string | null } | null;
          total?: {
            gross?: {
              amount?: number | null;
              currency?: string | null;
            } | null;
          } | null;
          lines?: Array<{
            id: string;
            productName: string;
            variantName: string | null;
            quantity: number;
            unitPrice?: {
              gross?: {
                amount?: number | null;
                currency?: string | null;
              } | null;
            } | null;
          }>;
        };
      }>;
    };
  };
  errors?: Array<{
    message?: string;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
};

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let upstream: Response;
    try {
      upstream = await fetch(SALEOR_API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SALEOR_APP_TOKEN}`,
        },
        body: JSON.stringify({
          query: ORDERS_QUERY,
          variables: {
            channel: DEFAULT_CHANNEL,
            first: 50,
          },
        }),
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    const rawText = await upstream.text();

    let parsed: SaleorOrdersResponse | null = null;
    try {
      parsed = rawText ? (JSON.parse(rawText) as SaleorOrdersResponse) : null;
    } catch {
      return fail("Saleor returned non-JSON response", 502, {
        saleorStatus: upstream.status,
        snippet: rawText.slice(0, 300),
      });
    }

    if (!upstream.ok) {
      return fail("Saleor HTTP error", 502, {
        saleorStatus: upstream.status,
        saleorBody: parsed ?? rawText.slice(0, 300),
      });
    }

    if (parsed?.errors?.length) {
      return fail("Saleor GraphQL error", 502, {
        saleorErrors: parsed.errors,
      });
    }

    const edges = parsed?.data?.orders?.edges ?? [];

    const orders = edges.map(({ node }) => ({
      id: node.id,
      number: node.number,
      created: node.created,
      status: node.status,
      userEmail: node.userEmail,
      billingAddress: {
        firstName: node.billingAddress?.firstName ?? null,
        lastName: node.billingAddress?.lastName ?? null,
      },
      channel: node.channel?.slug ?? null,
      totalAmount: node.total?.gross?.amount ?? 0,
      currency: node.total?.gross?.currency ?? "PHP",
      lines: (node.lines ?? []).map((line) => ({
        id: line.id,
        productName: line.productName,
        variantName: line.variantName,
        quantity: line.quantity,
        unitAmount: line.unitPrice?.gross?.amount ?? 0,
        currency: line.unitPrice?.gross?.currency ?? "PHP",
      })),
    }));

    return NextResponse.json(
      {
        ok: true,
        count: orders.length,
        channel: DEFAULT_CHANNEL,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return fail("Unhandled /api/orders failure", 500, {
      details: message,
    });
  }
}