import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SALEOR_API_URL =
  process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;

const SALEOR_APP_TOKEN = process.env.SALEOR_APP_TOKEN;

const UPDATE_METADATA_MUTATION = /* GraphQL */ `
  mutation UpdateOrderMetadata($id: ID!, $input: [MetadataInput!]!) {
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

type CashierStatus = "new" | "preparing" | "ready" | "completed" | "rejected";
type PaymentStatus = "pending" | "paid" | "failed";
type PaymentMethod = "cash" | "gcash";

interface UpdateStatusPayload {
  status: CashierStatus;
  reason?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  payrexPaymentId?: string;
}

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

async function handleUpdate(request: NextRequest, params: { id?: string }) {
  try {
    if (!SALEOR_API_URL) {
      return fail("Missing SALEOR_API_URL", 500);
    }

    if (!SALEOR_APP_TOKEN) {
      return fail("Missing SALEOR_APP_TOKEN", 500);
    }

    let orderId = params.id;
    if (!orderId) {
      return fail("Missing order id", 400);
    }

    // Defensive decode in case the ID is still URL-encoded.
    if (orderId.includes("%")) {
      try {
        orderId = decodeURIComponent(orderId);
      } catch {
        return fail("Invalid order id encoding", 400);
      }
    }

    let payload: UpdateStatusPayload | null = null;
    try {
      payload = (await request.json()) as UpdateStatusPayload;
    } catch {
      return fail("Invalid JSON body", 400);
    }

    if (!payload?.status) {
      return fail("Missing status", 400);
    }

    const { status, reason, paymentStatus, paymentMethod, payrexPaymentId } = payload;

    const metadataInput = [
      { key: "cashierStatus", value: status },
      { key: "cashierUpdatedAt", value: new Date().toISOString() },
    ];

    if (reason) {
      metadataInput.push({ key: "rejectionReason", value: reason });
    }

    if (paymentStatus) {
      metadataInput.push({ key: "paymentStatus", value: paymentStatus });
    }

    if (paymentMethod) {
      metadataInput.push({ key: "paymentMethod", value: paymentMethod });
    }

    if (payrexPaymentId) {
      metadataInput.push({ key: "payrexPaymentId", value: payrexPaymentId });
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
          query: UPDATE_METADATA_MUTATION,
          variables: {
            id: orderId,
            input: metadataInput,
          },
        }),
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    const rawText = await upstream.text();
    let parsed: any = null;

    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      return fail("Saleor returned non-JSON response", 502, {
        saleorStatus: upstream.status,
        snippet: rawText.slice(0, 300),
      });
    }

    if (!upstream.ok) {
      const saleorErrors = parsed?.errors ?? [];
      const firstError = saleorErrors[0]?.message;
      console.error("[cashier status] Saleor HTTP error", {
        saleorStatus: upstream.status,
        saleorErrors,
        saleorBody: parsed ?? rawText.slice(0, 300),
      });
      return fail(firstError || "Saleor HTTP error", 502, {
        saleorStatus: upstream.status,
        saleorErrors,
        saleorBody: parsed ?? rawText.slice(0, 300),
      });
    }

    if (parsed?.errors?.length) {
      const firstError = parsed.errors[0]?.message;
      return fail(firstError || "Saleor GraphQL error", 502, {
        saleorErrors: parsed.errors,
      });
    }

    const updateErrors = parsed?.data?.updateMetadata?.errors ?? [];
    if (updateErrors.length > 0) {
      return fail("Saleor metadata update error", 400, {
        saleorErrors: updateErrors,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        orderId,
        metadata: metadataInput.reduce<Record<string, string>>((acc, entry) => {
          acc[entry.key] = entry.value;
          return acc;
        }, {}),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return fail("Unhandled status update failure", 500, {
      details: message,
    });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id?: string }> }) {
  const params = await context.params;
  return handleUpdate(request, params);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id?: string }> }) {
  const params = await context.params;
  return handleUpdate(request, params);
}
