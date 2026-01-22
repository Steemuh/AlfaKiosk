"use client";

import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AddButton } from "./AddButton";
import { VariantSelector } from "@/ui/components/VariantSelector";
import { QuantitySelector } from "@/ui/components/QuantitySelector";
import { AddToCartConfirmation } from "@/ui/components/AddToCartConfirmation";
import { AvailabilityMessage } from "@/ui/components/AvailabilityMessage";
import type { ProductListItemFragment, VariantDetailsFragment } from "@/gql/graphql";

interface ProductFormProps {
	productName: string;
	productId: string;
	// price: string;
	variants: readonly VariantDetailsFragment[] | undefined;
	product: ProductListItemFragment;
	selectedVariant: VariantDetailsFragment | undefined;
	isAvailable: boolean;
	selectedVariantID: string | undefined;
	channel: string;
	action: (formData: FormData) => Promise<void>;
}

export const ProductForm = ({
	productName,
	productId,
	// price,
	variants,
	product,
	selectedVariant,
	isAvailable,
	selectedVariantID,
	channel,
	action,
}: ProductFormProps) => {
	const [quantity, setQuantity] = useState(1);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	// const { pending } = useFormStatus();
	// const pr = (price);
	const handleSubmit = async (formData: FormData) => {
		// Repeat the product addition for the specified quantity
		for (let i = 0; i < quantity; i++) {
			await action(formData);
		}
		setShowConfirmation(true);
		setQuantity(1);
		console.debug(productId);
		
	};

	return (
		<>
			<form
				ref={formRef}
				className="flex w-full flex-col gap-6"
				action={handleSubmit}
			>
				{variants && (
					<VariantSelector
						selectedVariant={selectedVariant}
						variants={variants}
						product={product}
						channel={channel}
					/>
				)}
				<AvailabilityMessage isAvailable={isAvailable} />
				<QuantitySelector maxQuantity={100} onQuantityChange={setQuantity} />
				<div className="mt-4">
					<AddButton disabled={!selectedVariantID || !selectedVariant?.quantityAvailable} />
				</div>
			</form>

			<AddToCartConfirmation
				isOpen={showConfirmation}
				quantity={quantity}
				productName={productName}
				onClose={() => setShowConfirmation(false)}
			/>
		</>
	);
};
