import { PaymentMethods } from "./PaymentMethods";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { Divider } from "@/checkout/components/Divider";
import { Title } from "@/checkout/components/Title";

export const PaymentSection = () => {
	return (
		<>
			<Divider />
			<div className="py-4" data-testid="paymentMethods">
				<Title>Payment</Title>
				<PaymentMethodSelector />
				<div className="mt-6">
					<PaymentMethods />
				</div>
			</div>
		</>
	);
};
