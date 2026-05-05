'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';
import OrderCard from '@/components/OrderCard';

export default function ReadyForPickupTab({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
	const { getOrdersByStatus, updateOrderStatus, addOrderListEntry, orders } = useOrderStore();
	const [mounted, setMounted] = useState(false);
	const [showHandOverModal, setShowHandOverModal] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const readyOrders = getOrdersByStatus('ready');

	const updateOrderStatusRemote = async (orderId: string, payload: { status: string }) => {
		if (!orderId) {
			throw new Error('Missing order id');
		}

		const encodedId = encodeURIComponent(orderId);
		const response = await fetch(`/api/orders/${encodedId}/status`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		let data: any = null;
		try {
			data = await response.json();
		} catch {
			data = null;
		}

		if (!response.ok || !data?.ok) {
			throw new Error(data?.error || `Failed to update order status (${response.status})`);
		}

		return data;
	};

	const handleMarkPickedUp = (orderId: string) => {
		setSelectedOrderId(orderId);
		setShowHandOverModal(true);
	};

	const handleConfirmHandedOver = async () => {
		if (!selectedOrderId) {
			return;
		}

		const order = orders.find((o) => o.id === selectedOrderId);
		if (!order) {
			setShowHandOverModal(false);
			setSelectedOrderId(null);
			return;
		}

		try {
			await updateOrderStatusRemote(selectedOrderId, { status: 'completed' });
			updateOrderStatus(selectedOrderId, 'completed');
			addOrderListEntry({
				orderId: order.orderId,
				customerName: order.customerName,
				customerEmail: order.customerEmail,
				items: order.items,
				action: 'handed-over',
			});

			setShowHandOverModal(false);
			setSelectedOrderId(null);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to mark order completed.';
			alert(message);
		}
	};

	if (!mounted) {
		return null;
	}

	const formatElapsedTime = (minutes: number) => {
		if (minutes < 60) {
			return `${minutes} min ago`;
		}
		const hours = Math.floor(minutes / 60);
		if (minutes < 1440) {
			return `${hours} hr${hours === 1 ? '' : 's'} ago`;
		}
		const days = Math.floor(minutes / 1440);
		return `${days} day${days === 1 ? '' : 's'} ago`;
	};

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
										elapsedTime: formatElapsedTime(elapsedTime),
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

			{showHandOverModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div
						className={`w-full max-w-md rounded-lg border p-5 shadow-xl ${
							theme === 'light' ? 'border-slate-300 bg-white' : 'border-slate-700 bg-slate-800'
						}`}
					>
						<h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
							Confirm Handed Over
						</h3>
						<p className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
							Are you sure this order has been handed over to the customer?
						</p>
						<div className="mt-4 flex gap-3">
							<button
								onClick={() => {
									setShowHandOverModal(false);
									setSelectedOrderId(null);
								}}
								className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
									theme === 'light'
										? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
										: 'bg-slate-700 text-white hover:bg-slate-600'
								}`}
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmHandedOver}
								className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
							>
								Confirm
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
