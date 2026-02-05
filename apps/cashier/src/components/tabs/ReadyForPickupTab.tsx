'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';
import OrderCard from '@/components/OrderCard';

export default function ReadyForPickupTab({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
	const { getOrdersByStatus, removeOrder } = useOrderStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const readyOrders = getOrdersByStatus('ready');

	const handleMarkPickedUp = (orderId: string) => {
		removeOrder(orderId);
	};

	if (!mounted) {
		return null;
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header Stats */}
			<div className="grid grid-cols-1 gap-2 sm:gap-4">
				<StatCard label="Ready for Pickup" value={readyOrders.length.toString()} color="green" theme={theme} />
			</div>

			{/* Orders List */}
			<div className="space-y-3 sm:space-y-4">
				{readyOrders.length === 0 ? (
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
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">No orders ready yet</h3>
						<p className="text-slate-400 text-sm sm:text-base">Waiting for orders to be marked as ready</p>
					</div>
				) : (
					readyOrders.map((order) => {
					const elapsedTime = Math.floor((Date.now() - order.createdAt) / 60000);
						return (
							<div key={order.id}>
								<OrderCard
									order={{
										...order,
										elapsedTime: `${elapsedTime} min ago`,
									items: order.items,
									}}
									onAccept={() => console.log('View order:', order.id)}
									onReject={() => handleMarkPickedUp(order.id)}
									showActions={true}
									actionLabels={{
										accept: 'View Details',
										reject: 'Handed Over',
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
	color: 'green' | 'red';
	theme?: 'light' | 'dark';
}

function StatCard({ label, value, color, theme = 'dark' }: StatCardProps) {
	const colorClasses: Record<string, Record<'light' | 'dark', string>> = {
		green: { light: 'bg-green-100 border-green-300 text-green-700', dark: 'bg-green-900/30 border-green-700 text-green-400' },
		red: { light: 'bg-red-100 border-red-300 text-red-700', dark: 'bg-red-900/30 border-red-700 text-red-400' },
	};

	return (
		<div className={`rounded-lg border p-3 sm:p-4 ${colorClasses[color][theme]}`}>
			<p className="text-xs sm:text-sm font-medium opacity-75 truncate">{label}</p>
			<p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{value}</p>
		</div>
	);
}
