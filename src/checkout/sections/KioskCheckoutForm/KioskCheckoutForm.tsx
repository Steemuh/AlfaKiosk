"use client";
import { Suspense } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { PaymentSection, PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection";

/**
 * Simplified checkout form for food kiosk - payment only
 * No user authentication, addresses, or shipping required
 * Summary is displayed on the right side, this component handles payment selection
 */
export const KioskCheckoutForm = () => {
	const { checkout } = useCheckout();

	if (!checkout) {
		return (
			<div className="flex flex-col gap-4">
				<PaymentSectionSkeleton />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-end">
			<div className="flex w-full flex-col rounded">
				{/* Payment section - select payment method */}
				<Suspense fallback={<PaymentSectionSkeleton />}>
					<PaymentSection />
				</Suspense>
			</div>
		</div>
	);
};
