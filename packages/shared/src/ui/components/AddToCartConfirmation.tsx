"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface AddToCartConfirmationProps {
	isOpen: boolean;
	quantity: number;
	productName: string;
	onClose: () => void;
}

export const AddToCartConfirmation = ({
	isOpen,
	quantity,
	productName,
	onClose,
}: AddToCartConfirmationProps) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(onClose, 3000);
			return () => clearTimeout(timer);
		}
	}, [isOpen, onClose]);

	if (!mounted || !isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
					aria-label="Close"
				>
					<X className="h-5 w-5" />
				</button>

				<div className="flex items-start gap-4">
					<div className="mt-1 flex-shrink-0">
						<CheckCircle className="h-6 w-6 text-green-600" />
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-neutral-900">Added to Cart</h3>
						<p className="mt-2 text-sm text-neutral-600">
							<span className="font-medium text-neutral-900">{quantity}</span> ×{" "}
							<span className="font-medium text-neutral-900">{productName}</span>
						</p>
						<p className="mt-3 text-xs text-neutral-500">This popup closes automatically in 3 seconds</p>
					</div>
				</div>
			</div>
		</div>
	);
};
