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

	// Show Saleor gateways if "saleor" is selected or if no method selected yet
	if (selectedMethod === "saleor" || selectedMethod === null) {
		// If still fetching Saleor gateways, show skeleton
		if (fetching) {
			return <PaymentSectionSkeleton />;
		}

		// If no Saleor gateways available, show message
		if (gatewaysWithDefinedComponent.length === 0) {
			return (
				<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<p className="text-sm text-yellow-800">
						<strong>Note:</strong> No other payment methods currently available.
						Please select GCash via PayRex above.
					</p>
				</div>
			);
		}

		// Show available Saleor gateways
		return (
			<div className="gap-y-8">
				{gatewaysWithDefinedComponent.map((gateway) => {
					const Component = paymentMethodToComponent[gateway.id];
					return (
						<Component
							key={gateway.id}
							// @ts-expect-error -- gateway matches the id but TypeScript doesn't know that
							config={gateway}
						/>
					);
				})}
			</div>
		);
	}

	// PayMaya not yet implemented
	if (selectedMethod === "paymaya") {
		return (
			<div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
				<p className="text-sm text-orange-800">
					<strong>Coming Soon:</strong> PayMaya payment method is not yet
					available. Please select GCash via PayRex instead.
				</p>
			</div>
		);
	}

	return null;
};
