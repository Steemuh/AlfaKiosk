'use client';

import { useMemo } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';

interface StatisticsPageProps {
	theme: 'light' | 'dark';
}

export default function StatisticsPage({ theme }: StatisticsPageProps) {
	const { orders, orderList } = useOrderStore();

	const {
		ordersToday,
		handedOverToday,
		rejectedToday,
		revenueToday,
		topItems,
		topRejectionReasons,
		completionRate,
		rejectionRate,
	} = useMemo(() => {
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const startTimestamp = startOfToday.getTime();

		const todaysOrders = orders.filter((order) => order.createdAt >= startTimestamp);
		const handedOver = orderList.filter(
			(entry) => entry.action === 'handed-over' && entry.timestamp >= startTimestamp,
		);
		const rejected = orderList.filter(
			(entry) => entry.action === 'rejected' && entry.timestamp >= startTimestamp,
		);

		const revenue = handedOver.reduce((sum, entry) => {
			const entryTotal = (entry.items ?? []).reduce(
				(itemSum, item) => itemSum + (item.price || 0) * item.quantity,
				0,
			);
			return sum + entryTotal;
		}, 0);

		const itemMap = new Map<string, number>();
		handedOver.forEach((entry) => {
			(entry.items ?? []).forEach((item) => {
				itemMap.set(item.name, (itemMap.get(item.name) ?? 0) + item.quantity);
			});
		});
		const topItemsList = Array.from(itemMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		const reasonMap = new Map<string, number>();
		rejected.forEach((entry) => {
			const reason = entry.notes && entry.notes.trim().length > 0 ? entry.notes : 'Unknown reason';
			reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
		});
		const topReasons = Array.from(reasonMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		const totalOrderCount = todaysOrders.length;
		const completion = totalOrderCount > 0 ? (handedOver.length / totalOrderCount) * 100 : 0;
		const rejection = totalOrderCount > 0 ? (rejected.length / totalOrderCount) * 100 : 0;

		return {
			ordersToday: todaysOrders.length,
			handedOverToday: handedOver.length,
			rejectedToday: rejected.length,
			revenueToday: revenue,
			topItems: topItemsList,
			topRejectionReasons: topReasons,
			completionRate: completion,
			rejectionRate: rejection,
		};
	}, [orders, orderList]);

	const StatCard = ({
		label,
		value,
		icon,
		color,
	}: {
		label: string;
		value: string | number;
		icon: string;
		color: string;
	}) => (
		<div
			className={`p-4 rounded-lg border-2 ${
				theme === 'light'
					? 'bg-white border-slate-200 text-slate-900'
					: 'bg-slate-800 border-slate-700 text-white'
			}`}
		>
			<div className="flex items-start justify-between">
				<div>
					<p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
						{label}
					</p>
					<p className="text-2xl font-bold mt-2">{value}</p>
				</div>
				<div className={`text-3xl ${color}`}>{icon}</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			<div>
				<h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Statistics Dashboard
				</h2>
				<p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
					Daily canteen summary with only the essentials
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<StatCard
					label="Orders Today"
					value={ordersToday}
					icon="📦"
					color="text-blue-500"
				/>
				<StatCard
					label="Revenue Today"
					value={`₱${revenueToday.toFixed(2)}`}
					icon="📈"
					color="text-emerald-500"
				/>
				<StatCard
					label="Completed Today"
					value={`${handedOverToday} (${completionRate.toFixed(0)}%)`}
					icon="✅"
					color="text-emerald-400"
				/>
				<StatCard
					label="Rejected Today"
					value={`${rejectedToday} (${rejectionRate.toFixed(0)}%)`}
					icon="🛑"
					color="text-red-400"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					className={`rounded-lg border-2 p-5 ${
						theme === 'light'
							? 'bg-white border-slate-200 text-slate-900'
							: 'bg-slate-800 border-slate-700 text-white'
					}`}
				>
					<h3 className="font-semibold mb-3">Top 5 Items Sold</h3>
					{topItems.length === 0 ? (
						<p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
							No completed orders today.
						</p>
					) : (
						<ul className="space-y-2 text-sm">
							{topItems.map(([name, quantity]) => (
								<li key={name} className="flex items-center justify-between">
									<span className="truncate">{name}</span>
									<span className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
										x{quantity}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				<div
					className={`rounded-lg border-2 p-5 ${
						theme === 'light'
							? 'bg-white border-slate-200 text-slate-900'
							: 'bg-slate-800 border-slate-700 text-white'
					}`}
				>
					<h3 className="font-semibold mb-3">Top Rejection Reasons</h3>
					{topRejectionReasons.length === 0 ? (
						<p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
							No rejected orders today.
						</p>
					) : (
						<ul className="space-y-2 text-sm">
							{topRejectionReasons.map(([reason, count]) => (
								<li key={reason} className="flex items-center justify-between">
									<span className="truncate">{reason}</span>
									<span className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
										{count}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
