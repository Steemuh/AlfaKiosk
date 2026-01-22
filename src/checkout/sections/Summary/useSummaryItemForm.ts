import { useCallback, useState } from "react";
import {
	type CheckoutLineFragment,
	useCheckoutLineDeleteMutation,
	useCheckoutLinesUpdateMutation,
} from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useForm } from "@/checkout/hooks/useForm";
import { useFormSubmit } from "@/checkout/hooks/useFormSubmit";
import { useSubmit } from "@/checkout/hooks/useSubmit/useSubmit";

export interface SummaryItemFormProps {
	line: CheckoutLineFragment;
}

export interface SummaryLineFormData {
	quantity: string;
}

export const useSummaryItemForm = ({ line }: SummaryItemFormProps) => {
	const [, updateLines] = useCheckoutLinesUpdateMutation();
	const [, deleteLines] = useCheckoutLineDeleteMutation();
	const [isQuantityUpdating, setIsQuantityUpdating] = useState(false);
	const { checkout } = useCheckout();

	const onSubmit = useFormSubmit<SummaryLineFormData, typeof updateLines>({
		scope: "checkoutLinesUpdate",
		onSubmit: updateLines,
		parse: ({ quantity, languageCode, checkoutId }) => ({
			languageCode,
			checkoutId,
			lines: [
				{
					quantity: Number(quantity),
					variantId: line.variant.id,
				},
			],
		}),
		onError: ({ formData: { quantity }, formHelpers: { setFieldValue } }) => {
			return setFieldValue("quantity", quantity);
		},
	});

	const form = useForm<SummaryLineFormData>({
		onSubmit,
		initialValues: { quantity: line.quantity.toString() },
	});

	const onLineDelete = useSubmit<{}, typeof deleteLines>({
		scope: "checkoutLinesDelete",
		onSubmit: deleteLines,
		parse: ({ languageCode, checkoutId }) => ({ languageCode, checkoutId, lineId: line.id }),
	});

	/**
	 * Increase quantity by 1 - kiosk-optimized direct operation
	 */
	const increaseQuantity = useCallback(async () => {
		if (!checkout?.id) return;
		const newQuantity = line.quantity + 1;
		setIsQuantityUpdating(true);
		try {
			await updateLines({
				languageCode: "EN_US",
				checkoutId: checkout.id,
				lines: [
					{
						quantity: newQuantity,
						variantId: line.variant.id,
					},
				],
			});
		} finally {
			setIsQuantityUpdating(false);
		}
	}, [line.quantity, line.variant.id, updateLines, checkout?.id]);

	/**
	 * Decrease quantity by 1, or delete line if quantity reaches 0
	 */
	const decreaseQuantity = useCallback(async () => {
		if (!checkout?.id) return;
		const newQuantity = Math.max(0, line.quantity - 1);

		setIsQuantityUpdating(true);
		try {
			if (newQuantity === 0) {
				// Delete the line when quantity reaches 0
				await deleteLines({
					languageCode: "EN_US",
					checkoutId: checkout.id,
					lineId: line.id,
				});
			} else {
				// Update quantity
				await updateLines({
					languageCode: "EN_US",
					checkoutId: checkout.id,
					lines: [
						{
							quantity: newQuantity,
							variantId: line.variant.id,
						},
					],
				});
			}
		} finally {
			setIsQuantityUpdating(false);
		}
	}, [line.quantity, line.variant.id, line.id, updateLines, deleteLines, checkout?.id]);

	return { form, onLineDelete, increaseQuantity, decreaseQuantity, isQuantityUpdating };
};
