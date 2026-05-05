'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';
import OrderCard from '@/components/OrderCard';

const PREDEFINED_REJECTION_REASONS = [
	'Item is out of stock',
	'Product unavailable',
	'Order exceeded preparation capacity',
	'Incorrect or incomplete order details',
	'Unable to fulfill the order at this time',
] as const;

const OTHER_REASON_VALUE = 'Others';

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

export default function IncomingOrdersTab({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
	const { getOrdersByStatus, updateOrderStatus, addOrderListEntry, orders } = useOrderStore();
	const [mounted, setMounted] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [selectedReason, setSelectedReason] = useState<string>('');
	const [customReason, setCustomReason] = useState('');

	useEffect(() => {
		setMounted(true);
	}, []);

	const incomingOrders = getOrdersByStatus('new').concat(getOrdersByStatus('incoming'));

	const updateOrderStatusRemote = async (orderId: string, payload: { status: string; reason?: string }) => {
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

	const handleAcceptOrder = async (orderId: string) => {
		try {
			await updateOrderStatusRemote(orderId, { status: 'preparing' });
			updateOrderStatus(orderId, 'preparing');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to accept order.';
			alert(message);
		}
	};

	const handleRejectOrder = (orderId: string) => {
		setSelectedOrderId(orderId);
		setSelectedReason('');
		setCustomReason('');
		setShowRejectModal(true);
	};

	const getFinalRejectionReason = () => {
		if (!selectedReason) {
			return '';
		}

		if (selectedReason === OTHER_REASON_VALUE) {
			return customReason.trim();
		}

		return selectedReason;
	};

	const isRejectReasonValid = getFinalRejectionReason().length > 0;

	const handleConfirmReject = async () => {
		if (!selectedOrderId) {
			return;
		}

		if (!selectedReason) {
			alert('Please select a rejection reason.');
			return;
		}

		const finalReason = getFinalRejectionReason();
		if (selectedReason === OTHER_REASON_VALUE && finalReason.length === 0) {
			alert('Please enter a custom rejection reason.');
			return;
		}

		const order = orders.find((o) => o.id === selectedOrderId);
		if (!order) {
			setShowRejectModal(false);
			setSelectedOrderId(null);
			return;
		}

		try {
			await updateOrderStatusRemote(selectedOrderId, { status: 'rejected', reason: finalReason });
			updateOrderStatus(selectedOrderId, 'rejected');
			addOrderListEntry({
				orderId: order.orderId,
				customerName: order.customerName,
				customerEmail: order.customerEmail,
				items: order.items,
				action: 'rejected',
				notes: finalReason,
			});

			setShowRejectModal(false);
			setSelectedOrderId(null);
			setSelectedReason('');
			setCustomReason('');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to reject order.';
			alert(message);
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
									elapsedTime: formatElapsedTime(elapsedTime),
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

			{showRejectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div
						className={`w-full max-w-md rounded-lg border p-5 shadow-xl ${
							theme === 'light' ? 'border-slate-300 bg-white' : 'border-slate-700 bg-slate-800'
						}`}
					>
						<h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
							Reject Order
						</h3>
						<p className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
							Please select a rejection reason to continue.
						</p>

						<div className="mt-3 space-y-2">
							{PREDEFINED_REJECTION_REASONS.map((reason) => {
								const isSelected = selectedReason === reason;
								return (
									<label
										key={reason}
										className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors ${
											isSelected
												? theme === 'light'
													? 'border-emerald-400 bg-emerald-50'
													: 'border-emerald-500 bg-emerald-900/20'
												: theme === 'light'
												? 'border-slate-300 bg-white hover:bg-slate-50'
												: 'border-slate-600 bg-slate-900 hover:bg-slate-700/60'
										}`}
									>
										<input
											type="radio"
											name="reject-reason"
											value={reason}
											checked={isSelected}
											onChange={(event) => setSelectedReason(event.target.value)}
											className="mt-1 h-4 w-4 accent-red-600"
										/>
										<span className={`text-sm ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
											{reason}
										</span>
									</label>
								);
							})}

							<label
								className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors ${
									selectedReason === OTHER_REASON_VALUE
										? theme === 'light'
											? 'border-emerald-400 bg-emerald-50'
											: 'border-emerald-500 bg-emerald-900/20'
										: theme === 'light'
										? 'border-slate-300 bg-white hover:bg-slate-50'
										: 'border-slate-600 bg-slate-900 hover:bg-slate-700/60'
								}`}
							>
								<input
									type="radio"
									name="reject-reason"
									value={OTHER_REASON_VALUE}
									checked={selectedReason === OTHER_REASON_VALUE}
									onChange={(event) => setSelectedReason(event.target.value)}
									className="mt-1 h-4 w-4 accent-red-600"
								/>
								<span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
									Others
								</span>
							</label>
						</div>

						<div
							className={`grid transition-all duration-200 ease-out ${
								selectedReason === OTHER_REASON_VALUE ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
							}`}
						>
							<div className="overflow-hidden">
								<textarea
									value={customReason}
									onChange={(event) => setCustomReason(event.target.value)}
									rows={3}
									placeholder="Enter custom rejection reason"
									className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
										theme === 'light'
											? 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500'
											: 'border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-emerald-500'
									}`}
								/>
							</div>
						</div>
						<div className="mt-4 flex gap-3">
							<button
								onClick={() => {
									setShowRejectModal(false);
									setSelectedOrderId(null);
									setSelectedReason('');
									setCustomReason('');
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
								onClick={handleConfirmReject}
								disabled={!isRejectReasonValid}
								className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
									isRejectReasonValid
										? 'bg-red-600 hover:bg-red-700'
										: 'cursor-not-allowed bg-red-400/70'
								}`}
							>
								Confirm Reject
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
