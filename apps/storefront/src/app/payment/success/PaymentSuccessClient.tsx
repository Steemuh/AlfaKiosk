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
					id
					productName
					quantity
					unitPrice {
						gross {
							amount
							currency
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

const fetchSaleorGraphQL = async <TResult, TVariables extends Record<string, unknown>>(
	query: string,
	variables: TVariables,
): Promise<TResult> => {
	if (!SALEOR_API_URL) {
		throw new Error("Missing NEXT_PUBLIC_SALEOR_API_URL env variable");
	}

	const response = await fetch(SALEOR_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
		cache: "no-store",
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data?.errors?.[0]?.message || `Saleor request failed (${response.status})`);
	}

	if (data?.errors?.length) {
		throw new Error(data.errors[0]?.message || "Saleor GraphQL error");
	}

	return data as TResult;
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
		const checkoutId = searchParams.get("checkoutId") || searchParams.get("checkout_id");

		if (!sessionFromQuery || !checkoutId) {
			setStatus("error");
			setMessage("Missing payment session information.");
			return;
		}

		setSessionId(sessionFromQuery);
		sessionStorage.setItem("payrexPaymentStatus", "success");
		sessionStorage.setItem("payrexPaidAt", new Date().toISOString());
		sessionStorage.setItem("payrexCheckoutId", checkoutId);
		sessionStorage.setItem("payrexSessionId", sessionFromQuery);

		const finalizeOrder = async () => {
			if (hasFinalizedRef.current) {
				return;
			}

			hasFinalizedRef.current = true;
			setStatus("verifying");
			setMessage("Checking your PayRex payment...");

			const storedOrder = readPendingPayrexOrder();
			if (!storedOrder || storedOrder.checkoutId !== checkoutId) {
				setStatus("error");
				setMessage("We could not find your pending order details. Please contact support.");
				return;
			}

			try {
				const response = await fetch(`/api/payrex/session?sessionId=${encodeURIComponent(sessionFromQuery)}`);
				const data = await response.json();
				const session = data.session;

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

				setPaymentSummary({
					customerName,
					customerEmail,
					pickupTime,
					amount,
				});

				setStatus("placing");
				setMessage("Creating your order...");

				const completionResult = await fetchSaleorGraphQL<{
					checkoutComplete?: {
						errors?: Array<{ field?: string | null; message?: string | null; code?: string | null }>;
						order?: {
							id: string;
							number?: string | null;
							total?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
							lines?: Array<{
								id: string;
								productName: string;
								quantity: number;
								unitPrice?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
							}>;
							billingAddress?: { firstName?: string | null; lastName?: string | null } | null;
						} | null;
					} | null;
				}, { checkoutId: string }>(CHECKOUT_COMPLETE_MUTATION, {
					checkoutId,
				});

				const completedOrder = completionResult.checkoutComplete?.order;
				const checkoutErrors = completionResult.checkoutComplete?.errors ?? [];
				if (checkoutErrors.length > 0 || !completedOrder) {
					throw new Error(checkoutErrors[0]?.message || "Failed to place the Saleor order.");
				}

				const items = completedOrder.lines?.map((line) => ({
					name: line.productName || "Item",
					quantity: line.quantity,
					price: line.unitPrice?.gross?.amount || 0,
				})) || [];
				const resolvedCustomerName = customerName || [
					completedOrder.billingAddress?.firstName,
					completedOrder.billingAddress?.lastName,
				].filter(Boolean).join(" ").trim() || "Customer";
+
				addOrder({
					orderId: completedOrder.number || completedOrder.id,
					customerName: resolvedCustomerName,
					customerEmail,
					pickupTime: pickupTime || "ASAP",
					items,
					status: "new",
					totalPrice: completedOrder.total?.gross?.amount || amount,
				});

				await fetch("/api/payrex/attach-order", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						orderId: completedOrder.id,
						payrexPaymentId: session?.id || sessionId || sessionFromQuery,
						paymentMethod: "gcash",
						paymentStatus: "paid",
						paidAmount: amount,
						paidAt: new Date().toISOString(),
						customerName: resolvedCustomerName,
						customerEmail,
						pickupTime,
						cashierStatus: "new",
					}),
				});

				clearPendingPayrexOrder();
				sessionStorage.removeItem("payrexPaymentStatus");
				sessionStorage.removeItem("payrexReturnToCheckout");
				setStatus("done");
				setMessage("Your order has been sent to the cashier.");
			} catch (error) {
				hasFinalizedRef.current = false;
				setStatus("error");
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