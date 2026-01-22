"use client";
import { type FC, useState } from "react";
import clsx from "clsx";
import { MinusIcon, PlusIcon, AlertCircle } from "lucide-react";

interface QuantitySelectorProps {
	quantity: number;
	onIncrease: () => void;
	onDecrease: () => void;
	isLoading?: boolean;
	disabled?: boolean;
	productName?: string;
}

/**
 * Touch-friendly quantity selector with large +/- buttons for kiosk UX
 * Minimum 48px tap area for accessibility on touchscreens
 * Shows confirmation dialog before removing item when quantity is 1
 */
export const QuantitySelector: FC<QuantitySelectorProps> = ({
	quantity,
	onIncrease,
	onDecrease,
	isLoading = false,
	disabled = false,
	productName = "this item",
}) => {
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const isDisabled = disabled || isLoading;
	const canDecrease = quantity > 0;

	const handleDecreaseClick = () => {
		// If quantity is 1, show confirmation dialog instead of decreasing
		if (quantity === 1) {
			setShowConfirmDialog(true);
		} else {
			// Otherwise decrease normally
			onDecrease();
		}
	};

	const handleConfirmRemove = () => {
		setShowConfirmDialog(false);
		onDecrease();
	};

	return (
		<>
			<div className="flex flex-col items-center gap-2">
				{/* Quantity Display */}
				<div className="min-h-12 min-w-16 flex items-center justify-center rounded border-2 border-neutral-200 bg-neutral-50 px-3 py-2">
					<span className="text-lg font-bold text-neutral-900">{quantity}</span>
				</div>

				{/* +/- Button Controls */}
				<div className="flex gap-2">
					{/* Decrease Button */}
					<button
						type="button"
						onClick={handleDecreaseClick}
						disabled={isDisabled || !canDecrease}
						aria-label={quantity === 1 ? "Remove item" : "Decrease quantity"}
						className={clsx(
							"flex items-center justify-center",
							"h-12 w-12 rounded border-2 transition-all",
							"text-lg font-semibold",
							isDisabled || !canDecrease
								? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
								: quantity === 1
									? "border-orange-300 bg-orange-50 text-orange-600 hover:border-orange-400 hover:bg-orange-100 active:bg-orange-200"
									: "border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100 active:bg-red-200",
						)}
					>
						<MinusIcon size={24} />
					</button>

					{/* Increase Button */}
					<button
						type="button"
						onClick={onIncrease}
						disabled={isDisabled}
						aria-label="Increase quantity"
						className={clsx(
							"flex items-center justify-center",
							"h-12 w-12 rounded border-2 transition-all",
							"text-lg font-semibold",
							isDisabled
								? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
								: "border-green-300 bg-green-50 text-green-600 hover:border-green-400 hover:bg-green-100 active:bg-green-200",
						)}
					>
						<PlusIcon size={24} />
					</button>
				</div>

				{/* Loading Indicator */}
				{isLoading && (
					<p className="text-xs text-neutral-500" aria-live="polite">
						Updating...
					</p>
				)}
			</div>

		{/* Confirmation Dialog for Item Removal */}
		{showConfirmDialog && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
				<div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-lg">
					{/* Dialog Header */}
					<div className="flex items-center gap-3">
						<AlertCircle className="h-6 w-6 text-red-600" />
						<h2 className="text-lg font-bold text-neutral-900">Remove Item?</h2>
					</div>

					{/* Dialog Message */}
					<p className="text-neutral-700">
						Are you sure you want to remove <strong>{productName}</strong> from your cart?
					</p>

					{/* Dialog Actions */}
					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={() => setShowConfirmDialog(false)}
							className="flex-1 rounded border-2 border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleConfirmRemove}
							disabled={isLoading}
							className="flex-1 rounded border-2 border-red-300 bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isLoading ? "Removing..." : "Remove"}
						</button>
					</div>
				</div>
			</div>
		)}
		</>
	);
};
