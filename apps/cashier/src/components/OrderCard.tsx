'use client';

import { useState } from 'react';
import { useCashierTheme } from '../app/cashier-theme-context';

interface OrderCardProps {
	order: {
		id: string;
		orderId: string;
		customerName: string;
		pickupTime: string;
		elapsedTime: string;
		items?: number | Array<{ name: string; quantity: number; price?: number }>;
		status: string;
	};
	onAccept: (orderId: string) => void;
	onReject: (orderId: string) => void;
	showActions?: boolean;
	expandOnAccept?: boolean;
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
	expandOnAccept = false,
	actionLabels = {},
}: OrderCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { theme } = useCashierTheme();
	const { accept = 'Accept', reject = 'Reject' } = actionLabels;
	const items = Array.isArray(order.items) ? order.items : [];

	const isNew = order.status === 'new';
	const getPriorityColor = () => {
		if (isNew) return theme === 'light' ? 'border-red-500 bg-red-100' : 'border-red-500 bg-red-900/20';
		if (order.status === 'preparing') return theme === 'light' ? 'border-yellow-500 bg-yellow-100' : 'border-yellow-500 bg-yellow-900/20';
		if (order.status === 'ready') return theme === 'light' ? 'border-green-500 bg-green-100' : 'border-green-500 bg-green-900/20';
		return theme === 'light' ? 'border-blue-500 bg-blue-100' : 'border-blue-500 bg-blue-900/20';
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
			className={`border-2 rounded-lg p-3 sm:p-5 transition-all cursor-pointer hover:shadow-lg ${getPriorityColor()}`}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4">
				{/* Left: Order Info */}
				<div className="flex-1 min-w-0 w-full sm:w-auto">
					<div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
						<span className={`${badge.color} text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0`}>
							{badge.label}
						</span>
						<span className={`text-xs sm:text-sm flex-shrink-0 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{order.elapsedTime}</span>
					</div>

					<div className="mb-2 sm:mb-3">
						<div className={`text-xl sm:text-2xl font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{order.orderId}</div>
						<div className={`text-base sm:text-lg mt-1 truncate font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{order.customerName}</div>
					</div>

					<div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
						<div>
							<span className={theme === 'light' ? 'text-slate-600' : 'text-slate-500'}>Pickup:</span>
							<div className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>{order.pickupTime}</div>
						</div>
						<div>
							<span className={theme === 'light' ? 'text-slate-600' : 'text-slate-500'}>Items:</span>
							<div className={theme === 'light' ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}>{typeof order.items === 'number' ? order.items : items.length}</div>
						</div>
					</div>
				</div>

				{/* Right: Action Buttons */}
				{showActions && (
					<div className="flex gap-2 w-full sm:w-auto flex-shrink-0 sm:flex-col">
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (expandOnAccept) {
									setIsExpanded((prev) => !prev);
								}
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
			<div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${theme === 'light' ? 'border-slate-300' : 'border-slate-600/50'}`}>
				<div className="space-y-2 text-xs sm:text-sm">
					<div className="flex justify-between">
						<span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Order ID:</span>
						<span className={`font-mono ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{order.orderId}</span>
					</div>
					<div className="flex justify-between">
						<span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Customer:</span>
						<span className={`truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{order.customerName}</span>
					</div>
					<div className="flex justify-between">
						<span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Pickup:</span>
						<span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{order.pickupTime}</span>
					</div>
					<div className="flex justify-between">
						<span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Status:</span>
						<span className={`capitalize ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{order.status}</span>
					</div>

					{/* Items Section */}
					<div className={`mt-3 pt-3 border-t ${theme === 'light' ? 'border-slate-300' : 'border-slate-600/50'}`}>
						<span className={`block mb-2 font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>Items Ordered:</span>
						<div className="space-y-2">
							{typeof order.items === 'number' ? (
								<div className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{order.items} item(s)</div>
							) : items.length > 0 ? (
								items.map((item, idx) => (
									<div key={idx} className={`flex justify-between p-2 rounded ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700/30'}`}>
										<div className="flex-1">
											<div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.name}</div>
											<div className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Qty: {item.quantity}</div>
										</div>
										{item.price && <div className="text-emerald-600 font-semibold">₱{(item.price * item.quantity).toFixed(2)}</div>}
									</div>
								))
							) : (
								<div className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>No items</div>
							)}
						</div>
					</div>
				</div>
			</div>
		)}
		</div>
	);
}
