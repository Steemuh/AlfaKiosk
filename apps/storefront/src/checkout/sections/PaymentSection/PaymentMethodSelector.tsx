"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { CreditCardIcon } from "lucide-react";

export type PaymentMethod = "gcash" | "paymaya" | "saleor" | null;

interface PaymentMethodContextType {
	selectedMethod: PaymentMethod;
	setSelectedMethod: (method: PaymentMethod) => void;
}

const PaymentMethodContext = createContext<PaymentMethodContextType | undefined>(
	undefined
);

export const usePaymentMethod = () => {
	const context = useContext(PaymentMethodContext);
	if (!context) {
		throw new Error("usePaymentMethod must be used within PaymentMethodProvider");
	}
	return context;
};

/**
 * Payment Method Provider - Wrap components that need payment method context
 */
export const PaymentMethodProvider = ({ children }: { children: ReactNode }) => {
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

	const contextValue: PaymentMethodContextType = {
		selectedMethod,
		setSelectedMethod,
	};

	return (
		<PaymentMethodContext.Provider value={contextValue}>
			{children}
		</PaymentMethodContext.Provider>
	);
};

interface PaymentMethodSelectorProps {
	onMethodSelect?: (method: PaymentMethod) => void;
}

/**
 * Payment Method Selector Component
 * Allows users to select between GCash (PayRex), PayMaya, or Saleor payment gateways
 */
export const PaymentMethodSelector = ({
	onMethodSelect,
}: PaymentMethodSelectorProps) => {
	const { selectedMethod, setSelectedMethod } = usePaymentMethod();

	const handleSelectMethod = (method: PaymentMethod) => {
		console.log("[Payment] Selected payment method:", method);
		setSelectedMethod(method);
		onMethodSelect?.(method);
	};

	return (
		<div className="space-y-4">
				<div className="text-sm text-neutral-600 font-medium">
					How would you like to pay?
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{/* GCash Option - PayRex */}
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
						<svg
							className="mb-2 h-8 w-8 text-blue-600"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.968 0 9 4.032 9 9s-4.032 9-9 9-9-4.032-9-9 4.032-9 9-9zm3.5 8h-3V8.5c0-.276-.224-.5-.5-.5s-.5.224-.5.5V11h-3c-.276 0-.5.224-.5.5s.224.5.5.5h3v3c0 .276.224.5.5.5s.5-.224.5-.5v-3h3c.276 0 .5-.224.5-.5s-.224-.5-.5-.5z" />
						</svg>
						<span className="font-medium text-neutral-900">
							GCash via PayRex
						</span>
						<span className="mt-1 text-xs text-neutral-500">
							Digital Payment
						</span>
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
						<span className="mt-1 text-xs text-neutral-500">
							Digital Payment
						</span>
					</button>

					{/* Saleor Payment Methods */}
					<button
						type="button"
						onClick={() => handleSelectMethod("saleor")}
						className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
							selectedMethod === "saleor"
								? "border-purple-500 bg-purple-50"
								: "border-neutral-200 bg-white hover:border-neutral-300"
						}`}
						aria-pressed={selectedMethod === "saleor"}
					>
						<CreditCardIcon className="mb-2 h-8 w-8 text-purple-600" />
						<span className="font-medium text-neutral-900">
							Other Methods
						</span>
						<span className="mt-1 text-xs text-neutral-500">
							Credit Card / Bank
						</span>
					</button>
				</div>

				{selectedMethod && (
					<div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700 border border-neutral-200">
						{selectedMethod === "gcash" && (
							<p>
								✓ You'll be redirected to PayRex to complete your payment via
								GCash securely.
							</p>
						)}
						{selectedMethod === "paymaya" && (
							<p>
								✓ You'll be redirected to complete your payment via PayMaya.
							</p>
						)}
						{selectedMethod === "saleor" && (
							<p>
								✓ Select your preferred payment method from the options below.
							</p>
						)}
					</div>
				)}
			</div>
	);
};
