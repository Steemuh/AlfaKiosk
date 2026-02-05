"use client";
import { useState } from "react";
import { CreditCardIcon } from "lucide-react";

export type PaymentMethod = "gcash" | "paymaya";

interface PaymentMethodSelectorProps {
	onMethodSelect?: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({ onMethodSelect }: PaymentMethodSelectorProps) => {
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

	const handleSelectMethod = (method: PaymentMethod) => {
		setSelectedMethod(method);
		onMethodSelect?.(method);
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-neutral-600">How would you like to pay?</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{/* GCash Option */}
				<button
					type="button"
					onClick={() => handleSelectMethod("gcash")}
					className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
						selectedMethod === "gcash"
							? "border-blue-500 bg-blue-50"
							: "border-neutral-200 bg-white hover:border-neutral-300"
					}`}
					aria-pressed={selectedMethod === "gcash"}
				>
					<CreditCardIcon className="mb-2 h-8 w-8 text-blue-600" />
					<span className="font-medium text-neutral-900">GCash</span>
					<span className="mt-1 text-xs text-neutral-500">Digital Payment</span>
				</button>

			{/* PayMaya Option */}
			<button
				type="button"
				onClick={() => handleSelectMethod("paymaya")}
				className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
					selectedMethod === "paymaya"
						? "border-green-500 bg-green-50"
						: "border-neutral-200 bg-white hover:border-neutral-300"
				}`}
				aria-pressed={selectedMethod === "paymaya"}
			>
				<CreditCardIcon className="mb-2 h-8 w-8 text-green-600" />
				<span className="font-medium text-neutral-900">PayMaya</span>
				<span className="mt-1 text-xs text-neutral-500">Digital Payment</span>
				</button>
			</div>

			{selectedMethod && (
				<div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700">
					{selectedMethod === "gcash" && (
						<p>You'll be redirected to complete your payment via GCash.</p>
					)}
					{selectedMethod === "paymaya" && (
						<p>You'll be redirected to complete your payment via PayMaya.</p>
					)}
				</div>
			)}
		</div>
	);
};
