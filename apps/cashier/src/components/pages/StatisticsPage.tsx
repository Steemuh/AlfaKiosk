'use client';

import { useState, useEffect } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';

interface StatisticsPageProps {
	theme: 'light' | 'dark';
}

export default function StatisticsPage({ theme }: StatisticsPageProps) {
	const { orders } = useOrderStore();
	const [stats, setStats] = useState({
		totalOrders: 0,
		completedOrders: 0,
		pendingOrders: 0,
		averageOrderValue: 0,
		totalRevenue: 0,
	});

	useEffect(() => {
		if (orders.length > 0) {
			const completed = orders.filter((o) => o.status === 'ready' || (o.status as string) === 'picked_up').length;
			const pending = orders.filter((o) => o.status === 'incoming' || o.status === 'preparing').length;
			const revenue = orders.reduce((sum, order) => {
				const orderTotal = order.items.reduce(
					(itemSum: number, item: any) =>
						itemSum + (item.price ? item.price * (item.quantity || 1) : 0),
					0
				);
				return sum + orderTotal;
			}, 0);

			setStats({
				totalOrders: orders.length,
				completedOrders: completed,
				pendingOrders: pending,
				averageOrderValue: orders.length > 0 ? revenue / orders.length : 0,
				totalRevenue: revenue,
			});
		}
	}, [orders]);

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
					Overview of store performance and order metrics
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				<StatCard
					label="Total Orders"
					value={stats.totalOrders}
					icon="📦"
					color="text-blue-500"
				/>
				<StatCard
					label="Completed"
					value={stats.completedOrders}
					icon="✅"
					color="text-green-500"
				/>
				<StatCard
					label="Pending"
					value={stats.pendingOrders}
					icon="⏳"
					color="text-yellow-500"
				/>
				<StatCard
					label="Avg Order Value"
					value={`$${stats.averageOrderValue.toFixed(2)}`}
					icon="💰"
					color="text-purple-500"
				/>
				<StatCard
					label="Total Revenue"
					value={`$${stats.totalRevenue.toFixed(2)}`}
					icon="📈"
					color="text-emerald-500"
				/>
			</div>

			<div
				className={`p-6 rounded-lg border-2 ${
					theme === 'light'
						? 'bg-blue-50 border-blue-200 text-blue-900'
						: 'bg-blue-900/30 border-blue-700 text-blue-300'
				}`}
			>
				<h3 className="font-semibold mb-2">Order Status Breakdown</h3>
				<div className="grid grid-cols-2 gap-4 mt-4">
					<div>
						<p className="text-sm opacity-75">Incoming</p>
						<p className="text-xl font-bold">
							{orders.filter((o) => o.status === 'incoming').length}
						</p>
					</div>
					<div>
						<p className="text-sm opacity-75">Preparing</p>
						<p className="text-xl font-bold">
							{orders.filter((o) => o.status === 'preparing').length}
						</p>
					</div>
					<div>
						<p className="text-sm opacity-75">Ready</p>
						<p className="text-xl font-bold">
							{orders.filter((o) => o.status === 'ready').length}
						</p>
					</div>
					<div>
						<p className="text-sm opacity-75">Picked Up</p>
						<p className="text-xl font-bold">
							{orders.filter((o) => (o.status as string) === 'picked_up').length}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
