import { useMemo } from "react";
import { useCheckoutCompleteMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useSubmit } from "@/checkout/hooks/useSubmit";
import { replaceUrl } from "@/checkout/lib/utils/url";
import { useOrderStore } from "@saleor/shared/lib/orderStore";

export const useCheckoutComplete = () => {
	const {
		checkout: { id: checkoutId },
	} = useCheckout();
	const [{ fetching }, checkoutComplete] = useCheckoutCompleteMutation();
	const addOrder = useOrderStore((state) => state.addOrder);

	const onCheckoutComplete = useSubmit<{ customerEmail?: string }, typeof checkoutComplete>(
		useMemo(
			() => ({
				parse: () => ({
					checkoutId,
				}),
				onSubmit: checkoutComplete,
				onSuccess: ({ data, formData }) => {
					const order = data.order;

					if (order) {
						// Save order to local store for Orders page
						const items = order.lines?.map((line) => ({
							name: line.productName || 'Item',
							quantity: line.quantity,
							price: line.unitPrice?.gross?.amount || 0,
						})) || [];

						// Get customer name from order's billing address
						const customerName = order.billingAddress?.firstName 
							? `${order.billingAddress.firstName} ${order.billingAddress.lastName || ''}`.trim()
							: 'Customer';

						// Use the order number from Saleor (e.g., "30")
						const orderNumber = order.number || order.id.substring(order.id.length - 6).toUpperCase();

						addOrder({
							orderId: orderNumber,
							customerName,
							customerEmail: formData.customerEmail,
							pickupTime: new Date(Date.now() + 45 * 60 * 1000).toTimeString().slice(0, 5),
							items,
							status: 'new',
							totalPrice: order.total?.gross?.amount || 0,
						});

						const newUrl = replaceUrl({
							query: {
								order: order.id,
							},
							replaceWholeQuery: true,
						});
						window.location.href = newUrl;
					}
				},
			}),
			[checkoutComplete, checkoutId, addOrder],
		),
	);
	return { completingCheckout: fetching, onCheckoutComplete };
};
