"use client";

import { useState } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import PlaceOrderModal from "@/checkout/components/PlaceOrderModal";

export const PayRexCheckout = () => {
	const { checkout } = useCheckout();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const cartItems = checkout?.lines?.map((line: any) => ({
		name: line.variant?.product?.name || "Item",
		quantity: line.quantity,
		price: parseFloat(String(line.unitPrice?.gross?.amount || "0")),
	})) || [];

	const amount = parseFloat(String(checkout?.totalPrice?.gross?.amount || "0"));
	const currency = checkout?.totalPrice?.gross?.currency || "PHP";

	const handleOpenModal = () => {
		if (!checkout?.id) {
			alert("Checkout not ready. Please try again.");
			return;
		}
		if (!cartItems.length || amount <= 0) {
			alert("Your cart is empty. Please add items before paying.");
			return;
		}

		setIsModalOpen(true);
	};

	return (
		<div className="space-y-4">
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h3 className="font-semibold text-blue-800 mb-2">PayRex GCash Payment</h3>
				<p className="text-sm text-blue-700">
					Enter your pickup details first, then pay securely with GCash.
				</p>
			</div>
			<div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
				<div className="font-medium text-slate-900">Payment summary</div>
				<div className="mt-2 space-y-1">
					<div>Items: {cartItems.length}</div>
					<div>Total: {currency} {amount.toFixed(2)}</div>
				</div>
			</div>
			<button
				onClick={handleOpenModal}
				disabled={!cartItems.length || amount <= 0}
				className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
					!cartItems.length || amount <= 0
						? "bg-blue-300 text-blue-900 cursor-not-allowed"
						: "bg-blue-600 hover:bg-blue-700 text-white"
				}`}
				title={
					!cartItems.length
						? "Your cart is empty"
						: amount <= 0
						? "Order amount not available"
						: "Enter pickup details before payment"
				}
			>
				Pay & Place Order
			</button>
			<PlaceOrderModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				cartItems={cartItems}
				totalPrice={amount}
			/>
		</div>
	);
};
