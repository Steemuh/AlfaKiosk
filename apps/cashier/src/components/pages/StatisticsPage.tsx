'use client';

import { useEffect, useMemo, useState } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';

interface StatisticsPageProps {
	theme: 'light' | 'dark';
}

export default function StatisticsPage({ theme }: StatisticsPageProps) {
	const { orders } = useOrderStore();
	const [todayKey, setTodayKey] = useState(() => formatDateKey(new Date()));
	const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
	const [history, setHistory] = useState<Record<string, DailyStats>>({});
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const interval = window.setInterval(() => {
			const nextKey = formatDateKey(new Date());
			setTodayKey((prev) => (prev === nextKey ? prev : nextKey));
		}, 60000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		try {
			const stored = window.localStorage.getItem('cashierDailyStats');
			if (!stored) {
				return;
			}
			const parsed = JSON.parse(stored) as Record<string, DailyStats>;
			setHistory(parsed ?? {});
		} catch {
			setHistory({});
		}
	}, [mounted]);

	const todayStats = useMemo(() => calculateDailyStats(orders, todayKey), [orders, todayKey]);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		setHistory((prev) => {
			const next = {
				...prev,
				[todayKey]: {
					...todayStats,
					date: todayKey,
				},
			};
			window.localStorage.setItem('cashierDailyStats', JSON.stringify(next));
			return next;
		});
	}, [mounted, todayKey, todayStats]);

	useEffect(() => {
		setSelectedDate((prev) => (prev ? prev : todayKey));
	}, [todayKey]);

	const selectedStats = history[selectedDate] ?? (selectedDate === todayKey ? todayStats : null);
	const historyDates = useMemo(() => {
		const entries = new Set(Object.keys(history));
		entries.add(todayKey);
		return Array.from(entries).sort().reverse();
	}, [history, todayKey]);

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

	if (!selectedStats) {
		return null;
	}

	const {
		ordersToday,
		handedOverToday,
		rejectedToday,
		revenueToday,
		topItems,
		topRejectionReasons,
		completionRate,
		rejectionRate,
	} = selectedStats;

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

			<div className={`rounded-lg border-2 p-4 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
							Daily Calendar
						</h3>
						<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
							Auto-saved daily snapshots with CSV export
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => exportCsv([selectedStats])}
							className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
								theme === 'light'
									? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
									: 'bg-slate-700 text-white hover:bg-slate-600'
							}`}
						>
							Export Selected Day
						</button>
						<button
							onClick={() => exportCsv(historyDates.map((date) => history[date] ?? (date === todayKey ? todayStats : null)).filter(Boolean) as DailyStats[])}
							className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
						>
							Export CSV
						</button>
					</div>
				</div>
				<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
					{historyDates.map((date) => {
						const snapshot = history[date] ?? (date === todayKey ? todayStats : null);
						if (!snapshot) {
							return null;
						}

						const isSelected = date === selectedDate;
						return (
							<button
								key={date}
								onClick={() => setSelectedDate(date)}
								className={`rounded-lg border px-3 py-3 text-left transition-colors ${
									isSelected
										? theme === 'light'
											? 'border-emerald-400 bg-emerald-50'
											: 'border-emerald-500 bg-emerald-900/30'
										: theme === 'light'
										? 'border-slate-200 bg-white hover:bg-slate-50'
										: 'border-slate-700 bg-slate-900 hover:bg-slate-800'
								}`}
							>
								<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
									{formatDisplayDate(date)}
								</p>
								<p className={`mt-2 text-sm font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
									{snapshot.ordersToday} orders
								</p>
								<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
									₱{snapshot.revenueToday.toFixed(2)} revenue
								</p>
							</button>
						);
					})}
				</div>
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

type DailyStats = {
	date: string;
	ordersToday: number;
	handedOverToday: number;
	rejectedToday: number;
	revenueToday: number;
	topItems: Array<[string, number]>;
	topRejectionReasons: Array<[string, number]>;
	completionRate: number;
	rejectionRate: number;
};

function formatDateKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateKey: string) {
	const [year, month, day] = dateKey.split('-');
	return `${month}/${day}/${year}`;
}

function calculateDailyStats(orders: any[], dateKey: string): DailyStats {
	const [year, month, day] = dateKey.split('-').map((part) => Number(part));
	const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
	const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
	const startTimestamp = startOfDay.getTime();
	const endTimestamp = endOfDay.getTime();

	const getOrderEventTimestamp = (order: { cashierUpdatedAt?: string; createdAt: number }) => {
		if (order.cashierUpdatedAt) {
			const parsed = Date.parse(order.cashierUpdatedAt);
			if (Number.isFinite(parsed)) {
				return parsed;
			}
		}

		return order.createdAt;
	};

	const todaysOrders = orders.filter((order) => order.createdAt >= startTimestamp && order.createdAt <= endTimestamp);
	const handedOver = orders.filter((order) => {
		if (order.status !== 'completed') {
			return false;
		}

		const timestamp = getOrderEventTimestamp(order);
		return timestamp >= startTimestamp && timestamp <= endTimestamp;
	});
	const rejected = orders.filter((order) => {
		if (order.status !== 'rejected') {
			return false;
		}

		const timestamp = getOrderEventTimestamp(order);
		return timestamp >= startTimestamp && timestamp <= endTimestamp;
	});

	const revenue = handedOver.reduce((sum: number, entry: any) => {
		const itemsTotal = (entry.items ?? []).reduce(
			(itemSum: number, item: any) => itemSum + (item.price || 0) * item.quantity,
			0,
		);
		const entryTotal = itemsTotal > 0 ? itemsTotal : entry.totalPrice ?? 0;
		return sum + entryTotal;
	}, 0);

	const itemMap = new Map<string, number>();
	handedOver.forEach((entry: any) => {
		(entry.items ?? []).forEach((item: any) => {
			itemMap.set(item.name, (itemMap.get(item.name) ?? 0) + item.quantity);
		});
	});
	const topItemsList = Array.from(itemMap.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const reasonMap = new Map<string, number>();
	rejected.forEach((entry) => {
		const reason = entry.rejectionReason && entry.rejectionReason.trim().length > 0
			? entry.rejectionReason
			: 'Unknown reason';
		reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
	});
	const topReasons = Array.from(reasonMap.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const totalOrderCount = todaysOrders.length;
	const completion = totalOrderCount > 0 ? (handedOver.length / totalOrderCount) * 100 : 0;
	const rejection = totalOrderCount > 0 ? (rejected.length / totalOrderCount) * 100 : 0;

	return {
		date: dateKey,
		ordersToday: todaysOrders.length,
		handedOverToday: handedOver.length,
		rejectedToday: rejected.length,
		revenueToday: revenue,
		topItems: topItemsList,
		topRejectionReasons: topReasons,
		completionRate: completion,
		rejectionRate: rejection,
	};
}

function exportCsv(rows: DailyStats[]) {
	const header = [
		'Date',
		'Orders',
		'Completed',
		'Rejected',
		'Revenue',
		'CompletionRate',
		'RejectionRate',
		'TopItems',
		'TopRejectionReasons',
	];

	const body = rows.map((row) => {
		const items = row.topItems.map(([name, qty]) => `${name} (x${qty})`).join('; ');
		const reasons = row.topRejectionReasons.map(([reason, count]) => `${reason} (${count})`).join('; ');
		return [
			row.date,
			row.ordersToday,
			row.handedOverToday,
			row.rejectedToday,
			row.revenueToday.toFixed(2),
			row.completionRate.toFixed(0),
			row.rejectionRate.toFixed(0),
			`"${items}"`,
			`"${reasons}"`,
		].join(',');
	});

	const csv = [header.join(','), ...body].join('\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `cashier-stats-${formatDateKey(new Date())}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}
