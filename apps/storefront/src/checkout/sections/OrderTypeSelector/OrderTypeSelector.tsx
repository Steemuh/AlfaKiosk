"use client";
import { useState } from "react";
import { ShoppingBagIcon, UtensilsCrossedIcon } from "lucide-react";

export type OrderType = "dine-in" | "takeout";

interface OrderTypeSelectorProps {
	onTypeSelect?: (type: OrderType) => void;
}

export const OrderTypeSelector = ({ onTypeSelect }: OrderTypeSelectorProps) => {
	const [selectedType, setSelectedType] = useState<OrderType | null>(null);

	const handleSelectType = (type: OrderType) => {
		setSelectedType(type);
		onTypeSelect?.(type);
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-neutral-600">How would you like to receive your order?</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{/* Dine In Option */}
				<button
					type="button"
					onClick={() => handleSelectType("dine-in")}
					className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
						selectedType === "dine-in"
							? "border-blue-500 bg-blue-50"
							: "border-neutral-200 bg-white hover:border-neutral-300"
					}`}
					aria-pressed={selectedType === "dine-in"}
				>
					<UtensilsCrossedIcon className="mb-2 h-8 w-8 text-blue-600" />
					<span className="font-medium text-neutral-900">Eat Inside</span>
					<span className="mt-1 text-xs text-neutral-500">At the Canteen</span>
				</button>

				{/* Take Out Option */}
				<button
					type="button"
					onClick={() => handleSelectType("takeout")}
					className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all ${
						selectedType === "takeout"
							? "border-green-500 bg-green-50"
							: "border-neutral-200 bg-white hover:border-neutral-300"
					}`}
					aria-pressed={selectedType === "takeout"}
				>
					<ShoppingBagIcon className="mb-2 h-8 w-8 text-green-600" />
					<span className="font-medium text-neutral-900">Take Out</span>
					<span className="mt-1 text-xs text-neutral-500">To Go</span>
				</button>
			</div>
		</div>
	);
};
