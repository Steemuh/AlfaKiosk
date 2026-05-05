import { NextResponse, type NextRequest } from "next/server";

interface PayRexCheckoutSessionRequest {
	orderId?: string;
	checkoutId: string;
	amount: number; // in PHP pesos
	currency: string; // e.g., "PHP"
	customerEmail?: string;
	customerName?: string;
	pickupTime?: string;
	customerPhone?: string;
	billingAddress?: {
		line1?: string;
		line2?: string;
		city?: string;
		state?: string;
		postalCode?: string;
		country?: string;
	};
	description: string;
	successUrl: string;
	failureUrl: string;
	cancelUrl?: string;
	items?: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
}

interface PayRexCheckoutSessionResponse {
	checkout_session_id: string;
	checkout_url: string;
	[key: string]: any;
}

type SaleorMetadataResponse = {
	data?: {
		updateMetadata?: {
			errors?: Array<{ field?: string; message?: string }>;
		};
	};
	errors?: Array<{ message?: string }>;
};

/**
 * POST /api/payrex/create-payment
 *
 * Creates a PayRex checkout session for GCash payment.
 * This is a server-side route to keep PAYREX_SECRET_KEY secure.
 */
export async function POST(request: NextRequest) {
	try {
		// Validate environment variables
		const secretKey = process.env.PAYREX_SECRET_API_KEY || process.env.PAYREX_SECRET_KEY;

		console.log("[PayRex API Route] Received request", {
			hasSecretKey: !!secretKey,
		});

		if (!secretKey) {
			console.error("[PayRex API Route] Missing PayRex configuration", {
				hasSecretKey: !!secretKey,
				availableKeys: Object.keys(process.env).filter(k => k.includes("PAYREX")),
			});
			return NextResponse.json(
				{ 
					error: "Payment gateway configuration incomplete", 
					details: "Missing secret API key",
					type: "CONFIG_ERROR",
				},
				{ status: 500 }
			);
		}

		const body: PayRexCheckoutSessionRequest = await request.json();
		console.log("[PayRex API Route] Request body received", {
			checkoutId: body.checkoutId,
			orderId: body.orderId,
			amount: body.amount,
			currency: body.currency,
			customerEmail: body.customerEmail,
			hasPhone: !!body.customerPhone,
			hasBillingAddress: !!body.billingAddress,
			itemCount: body.items?.length ?? 0,
		});

		// Validate request body
		const {
			checkoutId,
			orderId,
			amount,
			currency,
			customerEmail,
			customerName,
			pickupTime,
			customerPhone,
			billingAddress,
			description,
			successUrl,
			failureUrl,
			items,
		} = body;

		const normalizedCustomerName = customerName?.trim() || undefined;
		const normalizedCustomerEmail = customerEmail?.trim() || undefined;

		if (!checkoutId || !amount || !currency) {
			console.error("[PayRex API Route] Missing required fields", {
				checkoutId: !!checkoutId,
				amount: !!amount,
				currency: !!currency,
				customerEmail: !!customerEmail,
				customerName: !!customerName,
			});
			return NextResponse.json(
				{ 
					error: "Missing required fields", 
					details: "checkoutId, amount, currency are required",
					type: "VALIDATION_ERROR",
				},
				{ status: 400 }
			);
		}

		if (amount <= 0) {
			return NextResponse.json(
				{ 
					error: "Invalid amount", 
					details: "Amount must be greater than 0",
					type: "VALIDATION_ERROR",
					receivedAmount: amount,
				},
				{ status: 400 }
			);
		}

		const itemSummary = (items || [])
			.map((item) => `${item.name} x${item.quantity}`)
			.filter(Boolean)
			.join(", ");
		const baseDescription = description || `Checkout ${checkoutId}`;
		const fullDescriptionRaw = itemSummary
			? `${baseDescription} - Items: ${itemSummary}`
			: baseDescription;
		const fullDescription = fullDescriptionRaw.length > 200
			? `${fullDescriptionRaw.slice(0, 197)}...`
			: fullDescriptionRaw;

		const lineItems = (items && items.length > 0)
			? items.map((item) => ({
				name: item.name,
				amount: Math.round(item.price * 100),
				quantity: item.quantity,
			}))
			: [{
				name: fullDescription,
				amount: Math.round(amount * 100),
				quantity: 1,
			}];

		const billingAddressText = billingAddress
			? [
					billingAddress.line1,
					billingAddress.line2,
					billingAddress.city,
					billingAddress.state,
					billingAddress.postalCode,
					billingAddress.country,
				]
					.filter(Boolean)
					.join(", ")
			: undefined;

		console.log("[PayRex API Route] Creating checkout session", {
			currency: currency.toUpperCase(),
			paymentMethods: ["gcash"],
			lineItemCount: lineItems.length,
		});

		const payrexModule = await import("payrex-node");
		const createClient = typeof payrexModule.default === "function" ? payrexModule.default : payrexModule;
		const payrex = createClient(secretKey);

		let customerReferenceId: string | undefined;
		if (normalizedCustomerName && normalizedCustomerEmail) {
			try {
				const customer = await payrex.customers.create({
					name: normalizedCustomerName,
					email: normalizedCustomerEmail,
				});
				customerReferenceId = customer.id;
				console.log("[PayRex API Route] Customer created", {
					customerId: customerReferenceId,
				});
			} catch (customerError) {
				const errorDetails = (customerError as { errors?: unknown })?.errors;
				console.warn("[PayRex API Route] Failed to create customer, proceeding without prefill", {
					error: customerError instanceof Error ? customerError.message : String(customerError),
					errors: errorDetails,
				});
			}
		}

		let checkoutSession: PayRexCheckoutSessionResponse;
		try {
			checkoutSession = await payrex.checkoutSessions.create({
				currency: currency.toUpperCase(),
				success_url: successUrl,
				cancel_url: failureUrl,
				payment_methods: ["gcash"],
				line_items: lineItems,
				billing_details_collection: "auto",
				description: fullDescription,
				...(customerReferenceId ? { customer_reference_id: customerReferenceId } : {}),
				metadata: {
					checkout_id: checkoutId,
					amount: String(amount),
					currency: currency.toUpperCase(),
					item_count: String(items?.length ?? 0),
					...(orderId ? { order_id: orderId } : {}),
					...(normalizedCustomerEmail ? { customer_email: normalizedCustomerEmail } : {}),
					...(normalizedCustomerName ? { customer_name: normalizedCustomerName } : {}),
					...(pickupTime ? { pickup_time: pickupTime } : {}),
					...(customerPhone ? { customer_phone: customerPhone } : {}),
					...(billingAddressText ? { billing_address: billingAddressText } : {}),
					...(itemSummary ? { item_summary: itemSummary } : {}),
				},
			});
		} catch (sdkError) {
			const payrexErrors = (sdkError as { errors?: unknown })?.errors;
			console.error("[PayRex API Route] PayRex SDK error:", {
				error: sdkError instanceof Error ? sdkError.message : String(sdkError),
				details: sdkError,
				errors: payrexErrors,
			});
			return NextResponse.json(
				{
					error: "Failed to create payment session",
					details: payrexErrors || (sdkError instanceof Error ? sdkError.message : "PayRex SDK error"),
					type: "PAYREX_SDK_ERROR",
				},
				{ status: 502 }
			);
		}

		console.log("[PayRex API Route] Checkout session created", {
			sessionId: checkoutSession.checkout_session_id || checkoutSession.id,
			checkoutUrl: checkoutSession.checkout_url || checkoutSession.url,
		});

		const saleorApiUrl = process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;
		const appToken = process.env.SALEOR_APP_TOKEN;

		if (orderId && saleorApiUrl && appToken) {
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

			try {
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
							input: [
								{ key: "paymentStatus", value: "pending" },
								{ key: "paymentMethod", value: "gcash" },
								{
									key: "payrexPaymentId",
									value: checkoutSession.checkout_session_id || checkoutSession.id,
								},
							],
						},
					}),
				});

				const metadataJson = (await metadataResponse.json()) as SaleorMetadataResponse;
				if (!metadataResponse.ok || metadataJson?.errors?.length) {
					console.warn("[PayRex API Route] Failed to set payment metadata", {
						status: metadataResponse.status,
						errors: metadataJson.errors,
					});
				}

				const updateErrors = metadataJson?.data?.updateMetadata?.errors ?? [];
				if (updateErrors.length > 0) {
					console.warn("[PayRex API Route] Metadata update errors", updateErrors);
				}
			} catch (metadataError) {
				console.warn("[PayRex API Route] Metadata update failed", {
					error: metadataError instanceof Error ? metadataError.message : String(metadataError),
				});
			}
		} else {
			console.warn("[PayRex API Route] Saleor metadata update skipped - missing config");
		}

		// Return the checkout URL to the frontend
		return NextResponse.json(
			{
				success: true,
				checkoutUrl: checkoutSession.checkout_url || checkoutSession.url,
				sessionId: checkoutSession.checkout_session_id || checkoutSession.id,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("[PayRex API Route] Error creating PayRex checkout session:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
