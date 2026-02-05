'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@/lib/orderStore';
import OrderCard from '@/cashier/components/OrderCard';

export default function PreparingOrdersTab({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
	const { getOrdersByStatus, updateOrderStatus } = useOrderStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const preparingOrders = getOrdersByStatus('preparing');

	const handleMarkReady = (orderId: string) => {
		updateOrderStatus(orderId, 'ready');
	};

	const handleViewDetails = (orderId: string) => {
		console.log('View details for order:', orderId);
	};

	if (!mounted) {
		return null;
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header Stats */}
			<div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
			<StatCard label="Preparing" value={preparingOrders.length.toString()} color="purple" theme={theme} />
			<StatCard label="Avg Prep Time" value="12 min" color="blue" theme={theme} />
			<StatCard label="Peak Hours" value="16-17h" color="yellow" theme={theme} />
			</div>

			{/* Orders List */}
			<div className="space-y-3 sm:space-y-4">
				{preparingOrders.length === 0 ? (
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">No orders in preparation</h3>
						<p className="text-slate-400 text-sm sm:text-base">All caught up! Ready for incoming orders</p>
					</div>
				) : (
					preparingOrders.map((order) => {
					const elapsedTime = Math.floor((Date.now() - order.createdAt) / 60000);
						return (
							<div key={order.id} className="relative">
								<OrderCard
									order={{
										...order,
										elapsedTime: `${elapsedTime} min ago`,
										items: order.items.length,
									}}
									onAccept={() => handleViewDetails(order.id)}
									onReject={() => handleMarkReady(order.id)}
									showActions={true}
									actionLabels={{
										accept: 'View Items',
										reject: 'Mark Ready',
									}}
								/>
							</div>
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
	color: 'purple' | 'blue' | 'yellow';
	theme?: 'light' | 'dark';
}

function StatCard({ label, value, color, theme = 'dark' }: StatCardProps) {
	const colorClasses: Record<string, Record<'light' | 'dark', string>> = {
		purple: { light: 'bg-purple-100 border-purple-300 text-purple-700', dark: 'bg-purple-900/30 border-purple-700 text-purple-400' },
		blue: { light: 'bg-blue-100 border-blue-300 text-blue-700', dark: 'bg-blue-900/30 border-blue-700 text-blue-400' },
		yellow: { light: 'bg-yellow-100 border-yellow-300 text-yellow-700', dark: 'bg-yellow-900/30 border-yellow-700 text-yellow-400' },
	};

	return (
		<div className={`rounded-lg border p-3 sm:p-4 ${colorClasses[color][theme]}`}>
			<p className="text-xs sm:text-sm font-medium opacity-75 truncate">{label}</p>
			<p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</p>
		</div>
	);
}
