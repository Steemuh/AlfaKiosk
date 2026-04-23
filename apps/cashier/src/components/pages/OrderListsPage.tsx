'use client';

import { useMemo, useState } from 'react';
import { useOrderStore } from '@saleor/shared/lib/orderStore';

interface OrderListsPageProps {
	theme: 'light' | 'dark';
}

export default function OrderListsPage({ theme }: OrderListsPageProps) {
	const { orderList, clearOrderList } = useOrderStore();
	const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

	const sortedEntries = useMemo(
		() => [...orderList].sort((a, b) => b.timestamp - a.timestamp),
		[orderList],
	);

	const formatDateTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString();
	};

	const getActionClasses = (action: 'rejected' | 'handed-over') => {
		if (action === 'rejected') {
			return theme === 'light'
				? 'border-red-200 bg-red-50 text-red-700'
				: 'border-red-900/60 bg-red-950/30 text-red-300';
		}

		return theme === 'light'
			? 'border-emerald-200 bg-emerald-50 text-emerald-700'
			: 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300';
	};

	const getItemTotal = (price?: number, quantity?: number) => {
		if (typeof price !== 'number' || typeof quantity !== 'number') {
			return null;
		}

		return (price * quantity).toFixed(2);
	};

	const handleClearAll = () => {
		if (sortedEntries.length === 0) {
			return;
		}

		const shouldClear = window.confirm('Clear all order list records? This cannot be undone.');
		if (!shouldClear) {
			return;
		}

		setExpandedEntryId(null);
		clearOrderList();
	};

	const escapeCsv = (value: string) => {
		const safe = value.replace(/"/g, '""');
		return `"${safe}"`;
	};

	const handleExportCsv = () => {
		if (sortedEntries.length === 0) {
			alert('No records to export.');
			return;
		}

		const headers = [
			'Order ID',
			'Action',
			'Timestamp',
			'Customer Name',
			'Customer Email',
			'Reason/Notes',
			'Items',
			'Total (PHP)',
		];

		const rows = sortedEntries.map((entry) => {
			const items = (entry.items ?? []).map((item) => `${item.name} x${item.quantity}`).join('; ');
			const total = (entry.items ?? []).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

			return [
				entry.orderId,
				entry.action === 'rejected' ? 'Rejected' : 'Handed Over',
				formatDateTime(entry.timestamp),
				entry.customerName,
				entry.customerEmail ?? '',
				entry.notes ?? '',
				items,
				total.toFixed(2),
			];
		});

		const csvLines = [headers, ...rows].map((row) => row.map((value) => escapeCsv(String(value))).join(','));
		const csvContent = csvLines.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		const dateStamp = new Date().toISOString().slice(0, 10);

		link.href = url;
		link.download = `order-lists-${dateStamp}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Order Lists
				</h2>
				<p className={`mt-1 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
					Rejected and handed-over orders are recorded here.
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={handleClearAll}
						disabled={sortedEntries.length === 0}
						className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
							sortedEntries.length === 0
								? 'cursor-not-allowed bg-slate-500/40 text-white/70'
								: theme === 'light'
								? 'bg-red-600 text-white hover:bg-red-700'
								: 'bg-red-700 text-white hover:bg-red-600'
						}`}
					>
						Delete All
					</button>
					<button
						type="button"
						onClick={handleExportCsv}
						disabled={sortedEntries.length === 0}
						className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
							sortedEntries.length === 0
								? 'cursor-not-allowed bg-slate-500/40 text-white/70'
								: theme === 'light'
								? 'bg-emerald-600 text-white hover:bg-emerald-700'
								: 'bg-emerald-700 text-white hover:bg-emerald-600'
						}`}
					>
						Download Table (CSV)
					</button>
				</div>
			</div>

			{sortedEntries.length === 0 ? (
				<div
					className={`rounded-lg border px-4 py-8 text-center ${
						theme === 'light' ? 'border-slate-300 bg-white text-slate-600' : 'border-slate-700 bg-slate-800 text-slate-300'
					}`}
				>
					No orders have been logged yet.
				</div>
			) : (
				<div className="space-y-3">
					{sortedEntries.map((entry) => (
						<button
							type="button"
							key={entry.id}
							onClick={() => setExpandedEntryId((current) => (current === entry.id ? null : entry.id))}
							className={`w-full rounded-lg border p-4 text-left transition-colors ${
								theme === 'light'
									? 'border-slate-300 bg-white hover:bg-slate-50'
									: 'border-slate-700 bg-slate-800 hover:bg-slate-700/70'
							}`}
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="flex min-w-0 items-center gap-2">
									<p className={`truncate text-lg font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
										{entry.orderId}
									</p>
									<span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getActionClasses(entry.action)}`}>
										{entry.action === 'rejected' ? 'Rejected' : 'Handed Over'}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
										{formatDateTime(entry.timestamp)}
									</p>
									<span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
										{expandedEntryId === entry.id ? '▲' : '▼'}
									</span>
								</div>
							</div>

							<div className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
								Customer: <span className="font-medium">{entry.customerName}</span>
							</div>

							<div
								className={`grid transition-all duration-200 ease-out ${
									expandedEntryId === entry.id ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
								}`}
							>
								<div className="overflow-hidden">
									<div className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
										<div>
											Email:{' '}
											<span className="font-medium">
												{entry.customerEmail && entry.customerEmail.trim().length > 0
													? entry.customerEmail
													: 'No email provided'}
											</span>
										</div>

										<div>
											<div className="mb-1 font-medium">Ordered Items</div>
											{entry.items && entry.items.length > 0 ? (
												<div className="space-y-1">
													{entry.items.map((item, index) => (
														<div
															key={`${entry.id}-${index}`}
															className={`flex items-center justify-between rounded px-2 py-1 ${
																theme === 'light' ? 'bg-slate-100' : 'bg-slate-700/50'
															}`}
														>
															<span>{item.name} x{item.quantity}</span>
															<span>
																{getItemTotal(item.price, item.quantity) !== null ? `PHP ${getItemTotal(item.price, item.quantity)}` : '-'}
															</span>
														</div>
													))}
												</div>
											) : (
												<div className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>No item details recorded</div>
											)}
										</div>

										{entry.notes ? (
											<div className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
												Reason: {entry.notes}
											</div>
										) : null}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
