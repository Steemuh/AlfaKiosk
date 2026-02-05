'use client';

import { useState } from 'react';
import PlaceOrderModal from '@/checkout/components/PlaceOrderModal';
import { useCheckout } from '@/checkout/hooks/useCheckout';

export default function PlaceOrderButton() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { checkout } = useCheckout();

	// Get cart items from checkout
	const cartItems = checkout?.lines?.map((line: any) => ({
		name: line.variant?.product?.name || 'Unknown Item',
		quantity: line.quantity,
		price: parseFloat(line.unitPrice?.gross?.amount || '0'),
	})) || [];

	const totalPrice = parseFloat(checkout?.totalPrice?.gross?.amount || '0');

	const handlePlaceOrder = () => {
		if (!cartItems.length) {
			alert('Your cart is empty. Please add items before placing an order.');
			return;
		}
		setIsModalOpen(true);
	};

	return (
		<>
			<button
				onClick={handlePlaceOrder}
				disabled={!cartItems.length}
				className="mt-4 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
			>
				<svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4" />
				</svg>
				Place Order for Pickup
			</button>

			<PlaceOrderModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				cartItems={cartItems}
				totalPrice={totalPrice}
			/>
		</>
	);
}
