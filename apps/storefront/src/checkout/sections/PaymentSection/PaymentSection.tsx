"use client";

import { useEffect } from "react";
import { PaymentMethods } from "./PaymentMethods";
import { PaymentMethodSelector, PaymentMethodProvider } from "./PaymentMethodSelector";
import { Divider } from "@/checkout/components/Divider";
import { Title } from "@/checkout/components/Title";

interface CheckoutItem {
	name: string;
	quantity: number;
	price: number;
}

interface PaymentSectionProps {
	amount?: number;
	currency?: string;
	orderId?: string;
	items?: CheckoutItem[];
}

export const PaymentSection = ({
	amount,
	currency = "PHP",
	orderId,
	items = [],
}: PaymentSectionProps) => {
	useEffect(() => {
		// No-op effect to preserve hook ordering if needed later.
	}, []);

	console.log('[PaymentSection] Initialized with checkout data', { amount, currency, orderId, itemCount: items.length });

	return (
		<>
			<Divider />
			<div className="py-4" data-testid="paymentMethods">
				<Title>Payment</Title>
				<PaymentMethodProvider>
					<PaymentMethodSelector />
					<div className="mt-6">
						<PaymentMethods
							amount={amount}
							currency={currency}
							orderId={orderId}
							items={items}
						/>
					</div>
				</PaymentMethodProvider>
			</div>
		</>
	);
};
