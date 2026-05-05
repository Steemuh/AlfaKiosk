import { useMemo } from "react";
import { useCheckoutCompleteMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useSubmit } from "@/checkout/hooks/useSubmit";
import { useOrderStore } from "@saleor/shared/lib/orderStore";

export const useCheckoutComplete = () => {
	const {
		checkout: { id: checkoutId },
	} = useCheckout();
	const [{ fetching }, checkoutComplete] = useCheckoutCompleteMutation();
	const addOrder = useOrderStore((state) => state.addOrder);

	type CheckoutCompleteFormData = {
		customerEmail?: string;
		customerName?: string;
		items?: Array<{ name: string; quantity: number; price: number }>;
		totalPrice?: number;
		pickupTime?: string;
		paidViaPayrex?: boolean;
		payrexPaymentId?: string;
		paymentMethod?: string;
	};

	const attachPayrexPayment = async (orderId: string, formData: CheckoutCompleteFormData) => {
		if (!formData.paidViaPayrex) return;
		const payrexPaymentId = formData.payrexPaymentId || "";
		const paymentMethod = formData.paymentMethod || "gcash";
		const paidAt = new Date().toISOString();

		try {
			const response = await fetch("/api/payrex/attach-order", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					orderId,
					payrexPaymentId,
					paymentMethod,
					paymentStatus: "paid",
					paidAmount: formData.totalPrice ?? 0,
					paidAt,
					customerName: formData.customerName,
					customerEmail: formData.customerEmail,
					pickupTime: formData.pickupTime,
					cashierStatus: "new",
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				console.warn("[Checkout] Failed to attach PayRex payment", data?.error || response.statusText);
			}
		} catch (error) {
			console.warn("[Checkout] Failed to attach PayRex payment", error);
		}
	};

	const onCheckoutComplete = useSubmit<CheckoutCompleteFormData, typeof checkoutComplete>(
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
						const billingFirst = order.billingAddress?.firstName?.trim() || '';
						const billingLastRaw = order.billingAddress?.lastName?.trim() || '';
						const billingLast = billingLastRaw.toLowerCase() === 'customer' ? '' : billingLastRaw;
						const customerName = [billingFirst, billingLast].filter(Boolean).join(' ').trim() || 'Customer';

						// Use the order number from Saleor (e.g., "30")
						const orderNumber = order.number || order.id.substring(order.id.length - 6).toUpperCase();

						addOrder({
							orderId: orderNumber,
							customerName,
							customerEmail: formData.customerEmail,
							pickupTime: formData.pickupTime || new Date(Date.now() + 45 * 60 * 1000).toTimeString().slice(0, 5),
							items,
							status: 'new',
							totalPrice: order.total?.gross?.amount || 0,
						});

						void attachPayrexPayment(order.id, formData);
					}
				},
			}),
			[checkoutComplete, checkoutId, addOrder],
		),
	);
	return { completingCheckout: fetching, onCheckoutComplete };
};
