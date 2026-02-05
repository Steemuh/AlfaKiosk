"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
	maxQuantity?: number;
	onQuantityChange?: (quantity: number) => void;
}

export const QuantitySelector = ({ maxQuantity = 100, onQuantityChange }: QuantitySelectorProps) => {
	const [quantity, setQuantity] = useState(1);

	const handleIncrease = () => {
		if (quantity < maxQuantity) {
			const newQuantity = quantity + 1;
			setQuantity(newQuantity);
			onQuantityChange?.(newQuantity);
		}
	};

	const handleDecrease = () => {
		if (quantity > 1) {
			const newQuantity = quantity - 1;
			setQuantity(newQuantity);
			onQuantityChange?.(newQuantity);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
			setQuantity(value);
			onQuantityChange?.(value);
		}
	};

	return (
		<div className="mb-6">
			<label className="mb-2 block text-sm font-medium text-neutral-900">Quantity</label>
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={handleDecrease}
					disabled={quantity <= 1}
					className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Decrease quantity"
				>
					<Minus className="h-4 w-4" />
				</button>
				<input
					type="number"
					value={quantity}
					onChange={handleInputChange}
					min="1"
					max={maxQuantity}
					className="h-10 w-16 rounded-md border border-neutral-300 bg-white text-center text-sm font-medium"
					aria-label="Quantity input"
				/>
				<button
					type="button"
					onClick={handleIncrease}
					disabled={quantity >= maxQuantity}
					className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Increase quantity"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>
			<input type="hidden" name="quantity" value={quantity} />
		</div>
	);
};
