'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';
import OrderCard from '@/components/OrderCard';

export default function PreparingOrdersTab({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
	const { getOrdersByStatus, updateOrderStatus } = useOrderStore();
	const [mounted, setMounted] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const preparingOrders = getOrdersByStatus('preparing');

	const handleMarkReady = (orderId: string) => {
		setSelectedOrderId(orderId);
		setShowConfirmation(true);
	};

	const handleConfirmReady = () => {
		if (selectedOrderId) {
			updateOrderStatus(selectedOrderId, 'ready');
			setShowConfirmation(false);
			setSelectedOrderId(null);
		}
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
			<div className="grid grid-cols-1 gap-2 sm:gap-4">
				<StatCard label="Preparing" value={preparingOrders.length.toString()} color="purple" theme={theme} />
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
										items: order.items,
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

			{/* Confirmation Modal */}
			{showConfirmation && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-slate-700 shadow-xl">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-bold text-white">Confirm Ready?</h3>
						</div>
						
						<p className="text-slate-300 mb-6">
							Are you sure the food is ready to be marked as complete? Please verify all items have been prepared correctly before proceeding.
						</p>

						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowConfirmation(false);
									setSelectedOrderId(null);
								}}
								className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmReady}
								className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
							>
								Confirm Ready
							</button>
						</div>
					</div>
				</div>
			)}
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
