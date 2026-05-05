"use client";
import { Suspense } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { PaymentSection, PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection";

/**
 * Simplified checkout form for food kiosk - payment only
 * No user authentication, addresses, or shipping required
 * Summary is displayed on the right side, this component handles payment selection
 */
export const KioskCheckoutForm = ({ storeOpen = true }: { storeOpen?: boolean }) => {
	const { checkout } = useCheckout();

	if (!checkout) {
		return (
			<div className="flex flex-col gap-4">
				<PaymentSectionSkeleton />
			</div>
		);
	}

	// Extract checkout data for payment section
	const amount = checkout.totalPrice?.gross?.amount;
	const currency = checkout.totalPrice?.gross?.currency || "PHP";
	const orderId = checkout.id;
	const items = checkout.lines.map(line => ({
		name: line.variant?.product?.name || line.variant?.name || "Item",
		quantity: line.quantity,
		price: line.totalPrice?.gross?.amount || 0,
	}));

	return (
		<div className="flex flex-col items-end">
			<div className="flex w-full flex-col rounded">
				{/* Show message if store is closed */}
				{!storeOpen && (
					<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
						<p className="font-semibold">⚠️ Store is Closed</p>
						<p className="text-sm mt-1">We're not accepting orders right now. Please come back when we're open.</p>
					</div>
				)}
				
				{/* Payment section - select payment method */}
				<Suspense fallback={<PaymentSectionSkeleton />}>
					<PaymentSection
						amount={amount}
						currency={currency}
						orderId={orderId}
						items={items}
					/>
				</Suspense>
			</div>
		</div>
	);
};
