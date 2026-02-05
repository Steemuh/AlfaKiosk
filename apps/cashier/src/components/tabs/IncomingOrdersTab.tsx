'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';
import OrderCard from '@/components/OrderCard';

export default function IncomingOrdersTab({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
	const { getOrdersByStatus, updateOrderStatus, orders } = useOrderStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const incomingOrders = getOrdersByStatus('new').concat(getOrdersByStatus('incoming'));

	const handleAcceptOrder = (orderId: string) => {
		updateOrderStatus(orderId, 'preparing');
	};

	const handleRejectOrder = (orderId: string) => {
		// Remove from incoming (find the order and mark as rejected or delete)
		const order = orders.find(o => o.id === orderId);
		if (order) {
			updateOrderStatus(orderId, 'incoming');
		}
	};

	if (!mounted) {
		return null;
	}

	const newOrderCount = incomingOrders.filter((o) => o.status === 'new').length;

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header Stats */}
			<div className="grid grid-cols-1 gap-2 sm:gap-4">
				<StatCard label="New Orders" value={newOrderCount.toString()} color="red" theme={theme} />
			</div>

			{/* Orders List */}
			<div className="space-y-3 sm:space-y-4">
				{incomingOrders.length === 0 ? (
					<div className="text-center py-12 sm:py-16 bg-slate-800 rounded-lg border border-slate-700">
						<svg
							className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-500 mb-3 sm:mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">No incoming orders</h3>
						<p className="text-slate-400 text-sm sm:text-base">Waiting for new customer orders...</p>
					</div>
				) : (
					incomingOrders.map((order) => {
					const elapsedTime = Math.floor((Date.now() - order.createdAt) / 60000);
						return (
							<OrderCard
								key={order.id}
								order={{
									...order,
									elapsedTime: `${elapsedTime} min ago`,
									items: order.items,
								}}
								onAccept={handleAcceptOrder}
								onReject={handleRejectOrder}
								showActions={true}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}

interface StatCardProps {
	label: string;
	value: string;
	color: 'red' | 'blue' | 'yellow' | 'green';
	theme?: 'light' | 'dark';
}

function StatCard({ label, value, color, theme = 'dark' }: StatCardProps) {
	const colorClasses = {
		red: theme === 'light' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-red-900/30 border-red-700 text-red-400',
		blue: theme === 'light' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-900/30 border-blue-700 text-blue-400',
		yellow: theme === 'light' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
		green: theme === 'light' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-green-900/30 border-green-700 text-green-400',
	};

	return (
		<div className={`rounded-lg border p-3 sm:p-4 ${colorClasses[color]}`}>
			<p className="text-xs sm:text-sm font-medium opacity-75 truncate">{label}</p>
			<p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</p>
		</div>
	);
}
