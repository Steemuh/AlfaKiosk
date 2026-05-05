import { NextResponse, type NextRequest } from "next/server";

type AttachPaymentRequest = {
	orderId: string;
	payrexPaymentId?: string;
	paymentMethod?: string;
	paymentStatus?: "paid" | "failed" | "pending";
	paidAmount?: number;
	paidAt?: string;
	customerName?: string;
	customerEmail?: string;
	pickupTime?: string;
	cashierStatus?: string;
};

type SaleorMetadataResponse = {
	data?: {
		updateMetadata?: {
			errors?: Array<{ field?: string; message?: string }>;
		};
	};
	errors?: Array<{ message?: string }>;
};

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as AttachPaymentRequest;
		const {
			orderId,
			payrexPaymentId,
			paymentMethod = "gcash",
			paymentStatus = "paid",
			paidAmount,
			paidAt,
			customerName,
			customerEmail,
			pickupTime,
			cashierStatus = "new",
		} = body;

		if (!orderId) {
			return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
		}

		const saleorApiUrl = process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;
		const appToken = process.env.SALEOR_APP_TOKEN;

		if (!saleorApiUrl || !appToken) {
			return NextResponse.json({ error: "Saleor configuration missing" }, { status: 500 });
		}

		const metadataMutation = /* GraphQL */ `
			mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!) {
				updateMetadata(id: $id, input: $input) {
					errors {
						field
						message
					}
				}
			}
		`;

		const input = [
			{ key: "paymentStatus", value: paymentStatus },
			{ key: "paymentMethod", value: paymentMethod },
			{ key: "cashierStatus", value: cashierStatus },
		];

		if (payrexPaymentId) {
			input.push({ key: "payrexPaymentId", value: payrexPaymentId });
		}

		if (typeof paidAmount === "number") {
			input.push({ key: "paidAmount", value: String(paidAmount) });
		}

		if (paidAt) {
			input.push({ key: "paidAt", value: paidAt });
		}

		if (customerName) {
			input.push({ key: "customerName", value: customerName });
		}

		if (customerEmail) {
			input.push({ key: "customerEmail", value: customerEmail });
		}

		if (pickupTime) {
			input.push({ key: "pickupTime", value: pickupTime });
		}

		const metadataResponse = await fetch(saleorApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${appToken}`,
			},
			body: JSON.stringify({
				query: metadataMutation,
				variables: {
					id: orderId,
					input,
				},
			}),
		});

		const metadataJson = (await metadataResponse.json()) as SaleorMetadataResponse;
		if (!metadataResponse.ok || metadataJson?.errors?.length) {
			return NextResponse.json(
				{ error: "Failed to update order metadata", details: metadataJson?.errors },
				{ status: 502 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to attach payment to order";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
