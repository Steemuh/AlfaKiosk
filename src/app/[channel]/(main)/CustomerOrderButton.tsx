'use client';

import { useState } from 'react';
import PlaceOrderModal from '@/checkout/components/PlaceOrderModal';

export default function CustomerOrderButton() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsModalOpen(true)}
				className="fixed bottom-8 right-8 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2"
			>
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4"
					/>
				</svg>
				Place Order
			</button>

			<PlaceOrderModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				items={[{ name: 'Sample Food Item', quantity: 1, price: 15.99 }]}
				totalPrice={15.99}
			/>
		</>
	);
}
