'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/lib/orderStore';

export default function OrderConfirmationContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const orderId = searchParams.get('orderId');
	const { orders } = useOrderStore();
	const [order, setOrder] = useState<any>(null);

	useEffect(() => {
		if (orderId) {
			const foundOrder = orders.find((o) => o.orderId === orderId);
			setOrder(foundOrder);
		}
	}, [orderId, orders]);

	if (!order) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-white">Loading order details...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full">
				{/* Success Animation */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500 rounded-full mb-6 animate-bounce">
						<svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className="text-4xl font-bold text-white mb-2">Order Placed Successfully!</h1>
					<p className="text-xl text-emerald-400 mb-4">Order {order.orderId}</p>
					<p className="text-slate-300 text-lg">Your order is being prepared</p>
				</div>

				{/* Order Details Card */}
				<div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
					{/* Customer Info */}
					<div className="border-b border-slate-200 pb-6 mb-6">
						<h2 className="text-2xl font-bold text-slate-900 mb-4">Order Details</h2>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-slate-500 mb-1">Customer Name</p>
								<p className="text-lg font-semibold text-slate-900">{order.customerName}</p>
							</div>
							<div>
								<p className="text-sm text-slate-500 mb-1">Pickup Time</p>
								<p className="text-lg font-semibold text-slate-900">{order.pickupTime}</p>
							</div>
						</div>
					</div>

					{/* Order Items */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-slate-900 mb-4">Your Order</h3>
						<div className="space-y-3">
							{order.items.map((item: any, idx: number) => (
								<div key={idx} className="flex justify-between items-center py-2">
									<div>
										<p className="font-medium text-slate-900">{item.name}</p>
										<p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
									</div>
									<p className="font-semibold text-slate-900">₱{(item.price * item.quantity).toFixed(2)}</p>
								</div>
							))}
						</div>
					</div>

					{/* Total */}
					<div className="border-t border-slate-200 pt-4">
						<div className="flex justify-between items-center">
							<p className="text-xl font-bold text-slate-900">Total</p>
							<p className="text-2xl font-bold text-emerald-600">₱{order.totalPrice.toFixed(2)}</p>
						</div>
					</div>
				</div>

				{/* Status Info */}
				<div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0">
							<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
								<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white mb-2">What's Next?</h3>
							<ul className="space-y-2 text-slate-300">
								<li className="flex items-center gap-2">
									<span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
									Your order has been sent to the cashier
								</li>
								<li className="flex items-center gap-2">
									<span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
									Kitchen staff will start preparing your food
								</li>
								<li className="flex items-center gap-2">
									<span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
									Pick up at the counter at {order.pickupTime}
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-4">
					<button
						onClick={() => router.push('/')}
						className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
					>
						Back to Menu
					</button>
					<button
						onClick={() => router.push('/cashier')}
						className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
					>
						View in Cashier
					</button>
				</div>
			</div>
		</div>
	);
}
