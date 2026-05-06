import { useMemo } from "react";
import { paymentMethodToComponent } from "./supportedPaymentApps";
import { PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection/PaymentSectionSkeleton";
import { usePayments } from "@/checkout/sections/PaymentSection/usePayments";
import { useCheckoutUpdateState } from "@/checkout/state/updateStateStore";
import { usePaymentMethod } from "@/checkout/sections/PaymentSection/PaymentMethodSelector";
import { PayRexCheckout } from "@/checkout/sections/PaymentSection/PayRexCheckout";

interface PaymentMethodsProps {
	amount?: number;
	currency?: string;
	orderId?: string;
	items?: Array<{ name: string; quantity: number; price: number }>;
}

/**
 * Payment Methods Component
 * Displays either PayRex (GCash) or Saleor payment gateway options based on user selection
 */
export const PaymentMethods = ({
	amount,
	currency = "PHP",
	orderId,
	items = [],
}: PaymentMethodsProps) => {
	const { availablePaymentGateways, fetching } = usePayments();
	const { selectedMethod } = usePaymentMethod();
	const {
		changingBillingCountry,
		updateState: { checkoutDeliveryMethodUpdate },
	} = useCheckoutUpdateState();

	const gatewaysWithDefinedComponent = useMemo(
		() => availablePaymentGateways.filter((gateway) => gateway.id in paymentMethodToComponent),
		[availablePaymentGateways],
	);

	// delivery methods change total price so we want to wait until the change is done
	if (changingBillingCountry || checkoutDeliveryMethodUpdate === "loading") {
		return <PaymentSectionSkeleton />;
	}

	console.log("[PaymentMethods] Rendering", {
		selectedMethod,
		saleorGatewaysAvailable: gatewaysWithDefinedComponent.length,
		fetching,
		amount,
		currency,
		orderId,
		itemCount: items.length,
	});

	// Show PayRex checkout if GCash is selected
	if (selectedMethod === "gcash") {
		return <PayRexCheckout />;
	}

	return (
		<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
			<p className="text-sm text-blue-800">
				<strong>GCash only:</strong> PayRex checkout is the only payment method available for this kiosk flow.
			</p>
		</div>
	);
};
