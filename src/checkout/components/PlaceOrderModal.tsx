'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore, type OrderItem } from '@/lib/orderStore';

interface PlaceOrderModalProps {
	isOpen: boolean;
	onClose: () => void;
	cartItems?: Array<{ name: string; quantity: number; price: number }>;
	totalPrice?: number;
}

export default function PlaceOrderModal({
	isOpen,
	onClose,
	cartItems = [],
	totalPrice = 0,
}: PlaceOrderModalProps) {
	const router = useRouter();
	// Calculate pickup time: current time + 45 minutes
	const getDefaultPickupTime = () => {
		const now = new Date();
		now.setMinutes(now.getMinutes() + 45);
		return now.toTimeString().slice(0, 5); // HH:MM format
	};

	const [customerName, setCustomerName] = useState('Juan Dela Cruz');
	const [pickupTime, setPickupTime] = useState(getDefaultPickupTime());
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { addOrder } = useOrderStore();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!customerName.trim()) {
			alert('Please enter your name');
			return;
		}

		setIsSubmitting(true);

		// Simulate API call
		setTimeout(() => {
			const orderId = `#ORD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

			// Convert cart items to order items
			const orderItems: OrderItem[] = cartItems.length > 0 
				? cartItems.map((item) => ({
						name: item.name,
						quantity: item.quantity,
						price: item.price,
					}))
				: [{ name: 'Sample Item', quantity: 1, price: 15.99 }];

			addOrder({
				orderId,
				customerName: customerName.trim(),
				pickupTime,
				items: orderItems,
				status: 'new',
				totalPrice: totalPrice || 15.99,
			});

			// Reset form
			setCustomerName('Juan Dela Cruz');
			setPickupTime(getDefaultPickupTime());
			setIsSubmitting(false);
			onClose();

			// Redirect to order confirmation page
			router.push(`/order-confirmation?orderId=${encodeURIComponent(orderId)}`);
		}, 500);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold text-slate-900 mb-4">Place Order</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Customer Name */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Your Name
						</label>
						<input
							type="text"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Juan Dela Cruz"
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
							disabled={isSubmitting}
						/>
					</div>

					{/* Pickup Time */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Preferred Pickup Time
						</label>
						<input
							type="time"
							value={pickupTime}
							onChange={(e) => setPickupTime(e.target.value)}
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
							disabled={isSubmitting}
						/>
					</div>

					{/* Order Summary */}
					<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
						<h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
						<div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
							{cartItems.length > 0 ? (
								cartItems.map((item, idx) => (
									<div key={idx} className="flex justify-between text-sm">
										<span className="text-slate-700">
											{item.name} x{item.quantity}
										</span>
										<span className="text-slate-900 font-medium">
											₱{(item.price * item.quantity).toFixed(2)}
										</span>
									</div>
								))
							) : (
								<div className="text-sm text-slate-600">No items in cart</div>
							)}
						</div>
						<div className="border-t border-slate-300 pt-2">
							<div className="flex justify-between">
								<span className="font-semibold text-slate-900">Total:</span>
								<span className="font-bold text-emerald-600">
									₱{(totalPrice || 0).toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || cartItems.length === 0}
							className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50"
						>
							{isSubmitting ? 'Placing...' : 'Place Order'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
