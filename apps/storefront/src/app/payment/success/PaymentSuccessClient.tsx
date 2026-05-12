"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOrderStore } from "@saleor/shared/lib/orderStore";
import { clearPendingPayrexOrder, readPendingPayrexOrder } from "@/checkout/lib/payrexFlow";

type FinalizeStatus = "loading" | "verifying" | "placing" | "done" | "error";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL;

const CHECKOUT_COMPLETE_MUTATION = /* GraphQL */ `
	mutation checkoutComplete($checkoutId: ID!) {
		checkoutComplete(id: $checkoutId) {
			errors {
				field
				message
				code
			}
			order {
				id
				number
				total {
					gross {
						amount
						currency
					}
				}
				lines {
					productName
					quantity
					unitPrice {
						gross {
							amount
						}
					}
				}
				billingAddress {
					firstName
					lastName
				}
			}
		}
	}
`;

type CheckoutCompleteResponse = {
	data?: {
		checkoutComplete?: {
			errors?: Array<{ field?: string | null; message?: string | null; code?: string | null }>;
			order?: {
				id: string;
				number?: string | null;
				total?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
				lines?: Array<{
					productName: string;
					quantity: number;
					unitPrice?: { gross?: { amount?: number | null } | null } | null;
				}>;
				billingAddress?: { firstName?: string | null; lastName?: string | null } | null;
			} | null;
		};
	};
	errors?: Array<{ message?: string }>;
};

const completeCheckout = async (checkoutId: string) => {
	if (!SALEOR_API_URL) {
		throw new Error("Missing NEXT_PUBLIC_SALEOR_API_URL env variable");
	}

	const response = await fetch(SALEOR_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: CHECKOUT_COMPLETE_MUTATION,
			variables: { checkoutId },
		}),
		cache: "no-store",
	});

	const data = (await response.json()) as CheckoutCompleteResponse;
	if (!response.ok) {
		throw new Error(data?.errors?.[0]?.message || `Saleor request failed (${response.status})`);
	}

	if (data?.errors?.length) {
		throw new Error(data.errors[0]?.message || "Saleor GraphQL error");
	}

	const checkoutComplete = data?.data?.checkoutComplete;
	if (!checkoutComplete) {
		throw new Error("Saleor checkoutComplete returned no payload.");
	}

	if ((checkoutComplete.errors ?? []).length > 0 || !checkoutComplete.order) {
		const errorDetail = (checkoutComplete.errors ?? [])
			.map((error) => [error.code, error.field, error.message].filter(Boolean).join(": "))
			.join(" | ");
		throw new Error(errorDetail || "Failed to place order in Saleor.");
	}

	return checkoutComplete.order;
};

export const PaymentSuccessClient = () => {
	const searchParams = useSearchParams();
	const hasFinalizedRef = useRef(false);
	const addOrder = useOrderStore((state) => state.addOrder);
	const [status, setStatus] = useState<FinalizeStatus>("loading");
	const [message, setMessage] = useState<string>("Verifying payment...");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [paymentSummary, setPaymentSummary] = useState<{
		customerName?: string;
		customerEmail?: string;
		pickupTime?: string;
		amount?: number;
	} | null>(null);

	useEffect(() => {
		const sessionFromQuery = searchParams.get("session_id") || searchParams.get("sessionId");
		const checkoutIdFromQuery = searchParams.get("checkoutId") || searchParams.get("checkout_id");
		const storedSessionId = sessionStorage.getItem("payrexSessionId");
		const storedCheckoutId = sessionStorage.getItem("payrexCheckoutId");
		const storedPendingOrder = readPendingPayrexOrder();
		const resolvedSessionId = sessionFromQuery || storedSessionId || null;
		const resolvedCheckoutId = checkoutIdFromQuery || storedCheckoutId || storedPendingOrder?.checkoutId || null;

		console.debug("[PaymentSuccessClient] Loaded payment context", {
			querySessionId: sessionFromQuery,
			queryCheckoutId: checkoutIdFromQuery,
			storedSessionId,
			storedCheckoutId,
			hasPendingOrder: !!storedPendingOrder,
			resolvedSessionId,
			resolvedCheckoutId,
		});

		if (!resolvedSessionId || !resolvedCheckoutId) {
			setStatus("error");
			setMessage("Missing payment session information.");
			console.warn("[PaymentSuccessClient] Missing payment session information", {
				querySessionId: sessionFromQuery,
				queryCheckoutId: checkoutIdFromQuery,
				storedSessionId,
				storedCheckoutId,
				hasPendingOrder: !!storedPendingOrder,
			});
			return;
		}

		setSessionId(resolvedSessionId);
		sessionStorage.setItem("payrexPaymentStatus", "success");
		sessionStorage.setItem("payrexPaidAt", new Date().toISOString());
		sessionStorage.setItem("payrexCheckoutId", resolvedCheckoutId);
		sessionStorage.setItem("payrexSessionId", resolvedSessionId);

		const finalizeOrder = async () => {
			if (hasFinalizedRef.current) {
				return;
			}

			hasFinalizedRef.current = true;
			setStatus("verifying");
			setMessage("Checking your PayRex payment...");

			const storedOrder = storedPendingOrder || readPendingPayrexOrder();
			console.debug("[PaymentSuccessClient] Pending order loaded for finalization", {
				hasStoredOrder: !!storedOrder,
				storedOrderCheckoutId: storedOrder?.checkoutId,
				resolvedCheckoutId,
				resolvedSessionId,
			});
			if (!storedOrder || storedOrder.checkoutId !== resolvedCheckoutId) {
				setStatus("error");
				setMessage("We could not find your pending order details. Please contact support.");
				console.warn("[PaymentSuccessClient] Pending order checkoutId mismatch", {
					storedCheckoutId: storedOrder?.checkoutId,
					resolvedCheckoutId,
				});
				return;
			}

			try {
				console.debug("[PaymentSuccessClient] Verifying PayRex session", {
					sessionId: resolvedSessionId,
					checkoutId: resolvedCheckoutId,
				});
				const response = await fetch(`/api/payrex/session?sessionId=${encodeURIComponent(resolvedSessionId)}`);
				const data = await response.json();
				const session = data.session;
				console.debug("[PaymentSuccessClient] PayRex session response", {
					ok: response.ok,
					status: response.status,
					hasSession: !!session,
					responseKeys: data ? Object.keys(data) : [],
					sessionKeys: session ? Object.keys(session) : [],
				});

				if (!response.ok || !session) {
					throw new Error(data?.error || "Unable to verify PayRex session.");
				}

				const normalizedStatus = String(
					session?.status || session?.payment_status || session?.paymentStatus || ""
				).toLowerCase();
				const isPaid =
					normalizedStatus.includes("paid") ||
					normalizedStatus.includes("success") ||
					normalizedStatus.includes("completed") ||
					normalizedStatus.includes("succeeded") ||
					normalizedStatus.length === 0;

				if (!isPaid) {
					throw new Error("Payment has not been confirmed yet.");
				}

				const customerName =
					session?.metadata?.customer_name ||
					session?.customer?.name ||
					session?.billing_details?.name ||
					storedOrder.customerName;
				const customerEmail =
					session?.metadata?.customer_email ||
					session?.customer?.email ||
					session?.billing_details?.email ||
					storedOrder.customerEmail;
				const pickupTime = session?.metadata?.pickup_time || storedOrder.pickupTime;
				const amount = Number(session?.metadata?.amount || storedOrder.totalPrice || 0);
				console.debug("[PaymentSuccessClient] Resolved payment summary", {
					customerName,
					customerEmail,
					pickupTime,
					amount,
					normalizedStatus,
				});

				setPaymentSummary({
					customerName,
					customerEmail,
					pickupTime,
					amount,
				});

				setStatus("placing");
				setMessage("Creating your order...");

				const completedOrder = await completeCheckout(resolvedCheckoutId);

				addOrder({
					orderId: completedOrder.number || completedOrder.id,
					customerName: customerName || "Customer",
					customerEmail,
					pickupTime: pickupTime || "ASAP",
					items: completedOrder.lines?.map((line) => ({
						name: line.productName || "Item",
						quantity: line.quantity,
						price: line.unitPrice?.gross?.amount || 0,
					})) || storedOrder.items,
					status: "new",
					totalPrice: completedOrder.total?.gross?.amount || amount,
					paymentStatus: "paid",
					paymentMethod: "gcash",
					payrexPaymentId: session?.id || resolvedSessionId,
				});

				await fetch("/api/payrex/attach-order", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						orderId: completedOrder.id,
						payrexPaymentId: session?.id || resolvedSessionId,
						paymentMethod: "gcash",
						paymentStatus: "paid",
						paidAmount: amount,
						paidAt: new Date().toISOString(),
						customerName: customerName || "Customer",
						customerEmail,
						pickupTime,
						cashierStatus: "new",
					}),
				});

				clearPendingPayrexOrder();
				sessionStorage.removeItem("payrexPaymentStatus");
				sessionStorage.removeItem("payrexReturnToCheckout");
				sessionStorage.removeItem("payrexSessionId");
				sessionStorage.removeItem("payrexCheckoutId");

				// Clear client-side cart quantities stored per-channel and notify UI to refresh
				try {
					if (typeof window !== "undefined") {
						const keysToRemove: string[] = [];
						for (let i = 0; i < window.localStorage.length; i++) {
							const key = window.localStorage.key(i);
							if (key && key.startsWith("cartQuantities-")) keysToRemove.push(key);
						}
						keysToRemove.forEach((k) => window.localStorage.removeItem(k));

						// Remove any checkoutId-* cookies (best effort) so checkout link/badge resets
						document.cookie.split(";").forEach((c) => {
							const name = c.split("=")[0]?.trim();
							if (name && name.startsWith("checkoutId-")) {
								document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
							}
						});

						window.dispatchEvent(new Event("cart:updated"));
					}
				} catch (e) {
					console.warn("Failed to clear client cart state:", e);
				}
				setStatus("done");
				setMessage("Your order has been sent to the cashier.");
			} catch (error) {
				hasFinalizedRef.current = false;
				setStatus("error");
				console.error("[PaymentSuccessClient] finalizeOrder failed", error);
				setMessage(error instanceof Error ? error.message : "Failed to finalize your order.");
			}
		};

		void finalizeOrder();
	}, [searchParams, sessionId, addOrder]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="mb-6 flex justify-center">
						<div className={`rounded-full p-4 ${status === "error" ? "bg-red-100" : "bg-green-100"}`}>
							<svg
								className={`h-12 w-12 ${status === "error" ? "text-red-600" : "text-green-600"}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d={status === "error" ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"}
								/>
							</svg>
						</div>
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{status === "done" ? "Order Placed Successfully!" : status === "error" ? "Payment Verified, Order Pending" : "Payment Successful!"}
					</h1>
					<p className="text-gray-600 text-lg mb-2">{message}</p>

					{paymentSummary && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
							<p className="text-sm font-semibold text-green-900 mb-2">Payment Details:</p>
							<ul className="text-sm text-green-800 space-y-1">
								<li>✓ Payment status: Completed</li>
								<li>✓ Order queued for cashier</li>
								<li>✓ Pickup time: {paymentSummary.pickupTime}</li>
								<li>✓ Amount: ₱{paymentSummary.amount?.toFixed(2) || "0.00"}</li>
								{sessionId && (
									<li className="mt-3">
										<span className="text-xs text-green-700">Session ID: {sessionId.substring(0, 20)}...</span>
									</li>
								)}
							</ul>
						</div>
					)}

					{status === "error" && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
							<p className="text-sm text-red-800">We could not fully complete the order automatically. Please contact support if this keeps happening.</p>
						</div>
					)}

					<div className="space-y-3">
						<Link
							href="/"
							className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
						>
							Go to Home
						</Link>
						<Link
							href="/order-confirmation"
							className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
						>
							View Order Page
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};