'use client';

import { useState } from 'react';

interface OrderCardProps {
	order: {
		id: string;
		orderId: string;
		customerName: string;
		pickupTime: string;
		elapsedTime: string;
		items: number;
		status: string;
	};
	onAccept: (orderId: string) => void;
	onReject: (orderId: string) => void;
	showActions?: boolean;
	actionLabels?: {
		accept?: string;
		reject?: string;
	};
}

export default function OrderCard({
	order,
	onAccept,
	onReject,
	showActions = true,
	actionLabels = {},
}: OrderCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { accept = 'Accept', reject = 'Reject' } = actionLabels;

	const isNew = order.status === 'new';
	const getPriorityColor = () => {
		if (isNew) return 'border-red-500 bg-red-900/20';
		if (order.status === 'preparing') return 'border-yellow-500 bg-yellow-900/20';
		if (order.status === 'ready') return 'border-green-500 bg-green-900/20';
		return 'border-blue-500 bg-blue-900/20';
	};

	const getPriorityBadge = () => {
		if (isNew) return { label: '🔴 NEW', color: 'bg-red-600' };
		if (order.status === 'preparing') return { label: '⚙️ PREPARING', color: 'bg-yellow-600' };
		if (order.status === 'ready') return { label: '✅ READY', color: 'bg-green-600' };
		return { label: '📥 INCOMING', color: 'bg-blue-600' };
	};

	const badge = getPriorityBadge();

	return (
		<div
			className={`border-2 rounded-lg p-3 sm:p-5 transition-all cursor-pointer hover:shadow-lg ${getPriorityColor()} ${
				isNew ? 'animate-pulse' : ''
			}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4">
				{/* Left: Order Info */}
				<div className="flex-1 min-w-0 w-full sm:w-auto">
					<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
						<span className={`${badge.color} text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0`}>
							{badge.label}
						</span>
						<span className="text-xs sm:text-sm text-slate-400 flex-shrink-0">{order.elapsedTime}</span>
					</div>

					<div className="mb-2 sm:mb-3">
						<div className="text-xl sm:text-2xl font-bold text-white truncate">{order.orderId}</div>
						<div className="text-slate-300 text-base sm:text-lg mt-1 truncate">{order.customerName}</div>
					</div>

					<div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
						<div>
							<span className="text-slate-500">Pickup:</span>
							<div className="text-white font-semibold">{order.pickupTime}</div>
						</div>
						<div>
							<span className="text-slate-500">Items:</span>
							<div className="text-white font-semibold">{order.items}</div>
						</div>
					</div>
				</div>

				{/* Right: Action Buttons */}
				{showActions && (
					<div className="flex gap-2 w-full sm:w-auto flex-shrink-0 sm:flex-col">
						<button
							onClick={(e) => {
								e.stopPropagation();
								onAccept(order.id);
							}}
							className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
						>
							{accept}
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onReject(order.id);
							}}
							className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
						>
							{reject}
						</button>
					</div>
				)}
			</div>

			{/* Expanded Details */}
			{isExpanded && (
				<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600/50">
					<div className="space-y-2 text-xs sm:text-sm">
						<div className="flex justify-between">
							<span className="text-slate-400">Order ID:</span>
							<span className="text-white font-mono">{order.orderId}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Customer:</span>
							<span className="text-white truncate">{order.customerName}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Pickup:</span>
							<span className="text-white">{order.pickupTime}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Items:</span>
							<span className="text-white font-bold">{order.items}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-400">Status:</span>
							<span className="text-white capitalize">{order.status}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
