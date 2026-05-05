import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

interface PayRexWebhookEvent {
	type: string;
	data: {
		id: string;
		status: string;
		reference?: string;
		amount?: number;
		currency?: string;
		metadata?: Record<string, any>;
		payment_method_data?: {
			type: string;
			[key: string]: any;
		};
		[key: string]: any;
	};
	timestamp?: number;
}

/**
 * POST /api/payrex/webhook
 *
 * Webhook endpoint for PayRex payment events.
 * Receives payment status updates and updates order metadata in Saleor.
 */
export async function POST(request: NextRequest) {
	try {
		const webhookSecret = process.env.PAYREX_WEBHOOK_SECRET;

		if (!webhookSecret) {
			console.warn("PAYREX_WEBHOOK_SECRET not configured");
			// Still accept the webhook but log a warning
		}

		const body = await request.text();
		const event: PayRexWebhookEvent = JSON.parse(body);

		// Verify webhook signature if secret is available
		const signature = request.headers.get("x-payrex-signature");
		if (webhookSecret && signature) {
			const computedSignature = crypto
				.createHmac("sha256", webhookSecret)
				.update(body)
				.digest("hex");

			if (computedSignature !== signature) {
				console.error("Invalid webhook signature");
				return NextResponse.json(
					{ error: "Invalid signature" },
					{ status: 403 }
				);
			}
		}

		console.log("PayRex webhook received:", event.type, event.data.id);

		// Process based on event type
		switch (event.type) {
			case "checkout_session.payment_succeeded":
				await handlePaymentSucceeded(event);
				break;

			case "checkout_session.payment_failed":
				await handlePaymentFailed(event);
				break;

			case "checkout_session.expired":
				await handleCheckoutExpired(event);
				break;

			default:
				console.log(`Unhandled webhook type: ${event.type}`);
		}

		// Always return 200 to acknowledge receipt
		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}

/**
 * Handles successful payment event from PayRex
 */
async function handlePaymentSucceeded(event: PayRexWebhookEvent) {
	const { data } = event;
	const orderId = data.metadata?.order_id || data.reference;

	if (!orderId) {
		console.error("Missing order_id in webhook metadata");
		return;
	}

	console.log(`Payment succeeded for order: ${orderId}`);

	try {
		// UPDATE: Call Saleor API to update order metadata or create a payment transaction record
		// For now, we log the successful payment
		// You can later integrate this with Saleor's transaction system

		const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
		const appToken = process.env.SALEOR_APP_TOKEN;

		if (!saleorApiUrl || !appToken) {
			console.error("Saleor configuration missing");
			return;
		}

		const mutation = `
			mutation UpdateOrderMetadata($orderId: ID!, $input: [MetadataInput!]!) {
				updateMetadata(id: $orderId, input: $input) {
					errors {
						field
						message
					}
				}
			}
		`;

		const response = await fetch(saleorApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${appToken}`,
			},
			body: JSON.stringify({
				query: mutation,
				variables: {
					orderId: orderId,
					input: [
						{ key: "payrexPaymentId", value: data.id },
						{ key: "paymentStatus", value: "paid" },
						{ key: "paymentMethod", value: data.payment_method_data?.type || "gcash" },
					],
				},
			}),
		});

		const result = await response.json();

		if (result.errors) {
			console.error("Error updating order metadata:", result.errors);
		} else {
			console.log(`Order ${orderId} metadata updated successfully`);
		}
	} catch (error) {
		console.error("Error handling payment success:", error);
	}
}

/**
 * Handles failed payment event from PayRex
 */
async function handlePaymentFailed(event: PayRexWebhookEvent) {
	const { data } = event;
	const orderId = data.metadata?.order_id || data.reference;

	if (!orderId) {
		console.error("Missing order_id in webhook metadata");
		return;
	}

	console.log(`Payment failed for order: ${orderId}`);

	try {
		const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
		const appToken = process.env.SALEOR_APP_TOKEN;

		if (!saleorApiUrl || !appToken) {
			console.error("Saleor configuration missing");
			return;
		}

		const mutation = `
			mutation UpdateOrderMetadata($orderId: ID!, $input: [MetadataInput!]!) {
				updateMetadata(id: $orderId, input: $input) {
					errors {
						field
						message
					}
				}
			}
		`;

		const response = await fetch(saleorApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${appToken}`,
			},
			body: JSON.stringify({
				query: mutation,
				variables: {
					orderId: orderId,
					input: [
						{ key: "paymentStatus", value: "failed" },
						{ key: "paymentMethod", value: data.payment_method_data?.type || "gcash" },
						{ key: "payrexPaymentId", value: data.id },
					],
				},
			}),
		});

		const result = await response.json();

		if (result.errors) {
			console.error("Error updating order metadata:", result.errors);
		} else {
			console.log(`Order ${orderId} marked as payment failed`);
		}
	} catch (error) {
		console.error("Error handling payment failure:", error);
	}
}

/**
 * Handles expired checkout session event from PayRex
 */
async function handleCheckoutExpired(event: PayRexWebhookEvent) {
	const { data } = event;
	const orderId = data.metadata?.order_id || data.reference;

	if (!orderId) {
		console.error("Missing order_id in webhook metadata");
		return;
	}

	console.log(`Checkout session expired for order: ${orderId}`);
	// You can implement custom logic here (e.g., log expired sessions, notify admin, etc.)
}
