"use client";

import { useCallback, useState } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { Button } from "@/checkout/components";

/**
 * PayRex GCash Payment Component
 *
 * Handles payment initiation for GCash through PayRex.
 * Redirects user to PayRex checkout URL for payment completion.
 */
export const PayRexDropIn = () => {
	const { checkout } = useCheckout();
	const { completingCheckout } = { completingCheckout: false };
	const { showCustomErrors } = useAlerts();
	const [isProcessing, setIsProcessing] = useState(false);

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

	const handlePayWithGCash = useCallback(async () => {
		if (!checkout || !checkout.id) {
			showCustomErrors([{ message: "Checkout information not available" }]);
			return;
		}

		if (!checkout.totalPrice?.gross?.amount) {
			showCustomErrors([{ message: "Order amount not available" }]);
			return;
		}

		const customerName = checkout.billingAddress
			? `${checkout.billingAddress.firstName || "Customer"} ${checkout.billingAddress.lastName || ""}`.trim()
			: undefined;
		const customerEmail = checkout.email || undefined;

		setIsProcessing(true);

		try {
			// Step 1: Create payment session on server
			const createPaymentResponse = await fetch("/api/payrex/create-payment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					checkoutId: checkout.id,
					amount: checkout.totalPrice.gross.amount,
					currency: "PHP",
					customerEmail,
					customerName,
					description: `Checkout ${checkout.id}`,
					successUrl: `${appUrl}/payment/success?checkoutId=${checkout.id}`,
					failureUrl: `${appUrl}/payment/failed?checkoutId=${checkout.id}`,
					cancelUrl: `${appUrl}/payment/failed?checkoutId=${checkout.id}`,
				}),
			});

			if (!createPaymentResponse.ok) {
				const errorData = await createPaymentResponse.json();
				throw new Error(errorData.error || "Failed to create payment session");
			}

			const paymentData = await createPaymentResponse.json();

			if (!paymentData.checkoutUrl) {
				throw new Error("No checkout URL returned from payment server");
			}

			// Redirect to PayRex checkout URL for payment
			sessionStorage.setItem("payrexPaymentStatus", "pending");
			if (paymentData.sessionId) {
				sessionStorage.setItem("payrexSessionId", String(paymentData.sessionId));
			}
			window.location.href = paymentData.checkoutUrl;
		} catch (error) {
			console.error("PayRex payment error:", error);
			const errorMessage = error instanceof Error ? error.message : "Payment initialization failed";
			showCustomErrors([{ message: errorMessage }]);
			setIsProcessing(false);
		}
	}, [checkout, showCustomErrors, appUrl]);

	const isLoading = isProcessing || completingCheckout;

	return (
		<div className="py-4">
			<div className="rounded-lg border border-neutral-200 bg-white p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="flex-shrink-0">
						<svg
							className="h-8 w-8 text-blue-600"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-neutral-900">Pay with GCash</h3>
				</div>

				<p className="text-sm text-neutral-600 mb-6">
					You'll be securely redirected to PayRex to complete your payment via GCash. Your order will be created after you confirm payment.
				</p>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<p className="text-sm text-blue-900">
						<strong>Amount to pay:</strong> ₱{checkout?.totalPrice?.gross?.amount?.toFixed(2) || "0.00"}
					</p>
				</div>

				<Button
					onClick={handlePayWithGCash}
					disabled={isLoading}
					label={
						isLoading
							? "Processing..."
							: "Pay with GCash"
					}
					variant="primary"
					className="w-full"
				/>

				<p className="text-xs text-neutral-500 mt-4">
					This payment is processed securely by PayRex. Your payment method information is never shared with us.
				</p>
			</div>
		</div>
	);
};
