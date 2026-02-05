import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyCartPage } from "../EmptyCartPage";
import { PageNotFound } from "../PageNotFound";
import { Summary, SummarySkeleton } from "@/checkout/sections/Summary";
import { ProceedButton } from "@/checkout/sections/Summary/ProceedButton";
import { KioskCheckoutForm } from "@/checkout/sections/KioskCheckoutForm";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { CheckoutSkeleton } from "@/checkout/views/Checkout/CheckoutSkeleton";
import PlaceOrderButton from "@/checkout/components/PlaceOrderButton";

/**
 * Simplified Checkout for food kiosk - removes user authentication complexity
 */
export const Checkout = () => {
	const { checkout, fetching: fetchingCheckout } = useCheckout();

	const isCheckoutInvalid = !fetchingCheckout && !checkout;
	const isEmptyCart = checkout && !checkout.lines.length;

	const handleProceedPayment = () => {
		// Scroll to payment section
		const paymentSection = document.querySelector('[data-testid="paymentMethods"]');
		paymentSection?.scrollIntoView({ behavior: "smooth" });
	};

	// Show loading state while fetching
	if (fetchingCheckout) {
		return <CheckoutSkeleton />;
	}

	return isCheckoutInvalid ? (
		<PageNotFound />
	) : (
		<ErrorBoundary FallbackComponent={PageNotFound}>
			<div className="page">
				{isEmptyCart ? (
					<EmptyCartPage />
				) : (
					<div className="flex flex-col lg:max-w-2xl">
						<Suspense fallback={<SummarySkeleton />}>
							<Summary {...checkout} />
						</Suspense>
						
						<Suspense fallback={<CheckoutSkeleton />}>
							<KioskCheckoutForm />
						</Suspense>

						<PlaceOrderButton />
						
						<ProceedButton onClick={handleProceedPayment} disabled={!checkout?.lines.length} />
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
};
