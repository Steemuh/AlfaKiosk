'use client';

import { useState, useEffect } from 'react';
import { useStoreStatusStore } from '../../lib/storeStatusStore';
import { useOrderStore } from '@saleor/shared/lib/orderStore';

interface StoreStatusPageProps {
	theme: 'light' | 'dark';
}

export default function StoreStatusPage({ theme }: StoreStatusPageProps) {
	const { status, setStoreOpen, setStaffOnDuty, setOrdersInProgress, setDeliveryAvailable, setTakeoutAvailable, setDineInAvailable } = useStoreStatusStore();
	const { orders } = useOrderStore();
	const [showCloseModal, setShowCloseModal] = useState(false);
	const [closureReason, setClosureReason] = useState('');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Update orders in progress count
		const preparingOrders = orders.filter(o => o.status === 'preparing').length;
		setOrdersInProgress(preparingOrders);
	}, [orders, setOrdersInProgress]);

	if (!mounted) {
		return null;
	}

	const handleToggleStore = () => {
		if (status.isOpen) {
			setShowCloseModal(true);
		} else {
			setStoreOpen(true);
		}
	};

	const handleConfirmClose = () => {
		setStoreOpen(false, closureReason || 'Store closed by staff');
		setShowCloseModal(false);
		setClosureReason('');
		// Notify API/storefront that store is closed
		fetch('/api/store-status', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isOpen: false, reason: closureReason || 'Store closed by staff' }),
		}).catch(err => console.error('Failed to update store status on server:', err));
	};

	const StatusIndicator = ({
		label,
		status,
		icon,
	}: {
		label: string;
		status: 'online' | 'offline' | 'warning';
		icon: string;
	}) => {
		const statusColors = {
			online:
				theme === 'light'
					? 'bg-green-50 border-green-300 text-green-900'
					: 'bg-green-900/30 border-green-700 text-green-300',
			offline:
				theme === 'light'
					? 'bg-red-50 border-red-300 text-red-900'
					: 'bg-red-900/30 border-red-700 text-red-900',
			warning:
				theme === 'light'
					? 'bg-yellow-50 border-yellow-300 text-yellow-900'
					: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
		};

		const statusDots = {
			online: '🟢',
			offline: '🔴',
			warning: '🟡',
		};

		return (
			<div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-2xl">{icon}</span>
						<div>
							<p className="font-semibold">{label}</p>
							<p className="text-xs opacity-75 mt-1">
								{status === 'online' && 'System operational'}
								{status === 'offline' && 'System unavailable'}
								{status === 'warning' && 'Requires attention'}
							</p>
						</div>
					</div>
					<span className="text-2xl">{statusDots[status]}</span>
				</div>
			</div>
		);
	};

	const ServiceToggle = ({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) => (
		<div className={`p-4 rounded-lg border-2 flex items-center justify-between ${
			theme === 'light'
				? 'bg-white border-slate-200 hover:border-slate-300'
				: 'bg-slate-800 border-slate-700 hover:border-slate-600'
		}`}>
			<p className="font-semibold">{label}</p>
			<button
				onClick={() => onChange(!enabled)}
				className={`px-4 py-2 rounded-lg font-semibold transition-all ${
					enabled
						? 'bg-emerald-500 hover:bg-emerald-600 text-white'
						: 'bg-slate-400 hover:bg-slate-500 text-white'
				}`}
			>
				{enabled ? 'Available' : 'Unavailable'}
			</button>
		</div>
	);

	return (
		<div className="space-y-6">
			<div>
				<h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Store Status
				</h2>
				<p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
					Monitor store operations and system health
				</p>
			</div>

			{/* Store Open/Close with Closure Info */}
			<div
				className={`p-6 rounded-lg border-2 ${
					status.isOpen
						? theme === 'light'
							? 'bg-emerald-50 border-emerald-300'
							: 'bg-emerald-900/20 border-emerald-700'
						: theme === 'light'
						? 'bg-red-50 border-red-300'
						: 'bg-red-900/20 border-red-700'
				}`}
			>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
							Store Status
						</h3>
						<p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
							{status.isOpen ? (
								<span className="flex items-center gap-2">
									<span className="text-xl">🟢</span> Store is currently open
								</span>
							) : (
								<span className="flex items-center gap-2">
									<span className="text-xl">🔴</span> Store is currently closed
									{status.closureReason && <span className="text-xs opacity-75">({status.closureReason})</span>}
								</span>
							)}
						</p>
					</div>
					<button
						onClick={handleToggleStore}
						className={`px-6 py-2 rounded-lg font-semibold transition-all ${
							status.isOpen
								? 'bg-emerald-500 hover:bg-emerald-600 text-white'
								: 'bg-slate-400 hover:bg-slate-500 text-white'
						}`}
					>
						{status.isOpen ? 'Close Store' : 'Open Store'}
					</button>
				</div>
				{!status.isOpen && status.closedAt && (
					<p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
						Closed at {new Date(status.closedAt).toLocaleTimeString()}
					</p>
				)}
			</div>

			{/* Key Metrics */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Current Operations
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className={`p-4 rounded-lg border-2 ${theme === 'light' ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-blue-900/30 border-blue-700 text-blue-300'}`}>
						<p className="text-sm opacity-75">Staff On Duty</p>
						<p className="text-3xl font-bold mt-2">{status.staffOnDuty}</p>
					</div>
					<div className={`p-4 rounded-lg border-2 ${theme === 'light' ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-purple-900/30 border-purple-700 text-purple-300'}`}>
						<p className="text-sm opacity-75">Orders Preparing</p>
						<p className="text-3xl font-bold mt-2">{status.ordersInProgress}</p>
					</div>
					<div className={`p-4 rounded-lg border-2 ${theme === 'light' ? 'bg-orange-50 border-orange-300 text-orange-900' : 'bg-orange-900/30 border-orange-700 text-orange-300'}`}>
						<p className="text-sm opacity-75">Last Updated</p>
						<p className="text-sm font-semibold mt-2">{new Date(status.lastUpdated).toLocaleTimeString()}</p>
					</div>
				</div>
			</div>

			{/* Service Availability */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Service Availability
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<ServiceToggle 
						label="🚚 Delivery" 
						enabled={status.deliveryAvailable}
						onChange={setDeliveryAvailable}
					/>
					<ServiceToggle 
						label="📦 Takeout" 
						enabled={status.takeoutAvailable}
						onChange={setTakeoutAvailable}
					/>
					<ServiceToggle 
						label="🪑 Dine-In" 
						enabled={status.dineInAvailable}
						onChange={setDineInAvailable}
					/>
				</div>
			</div>

			{/* Staff Management */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Staff Management
				</h3>
				<div className={`p-4 rounded-lg border-2 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
								Staff On Duty: {status.staffOnDuty}
							</label>
							<input
								type="range"
								min="0"
								max="15"
								value={status.staffOnDuty}
								onChange={(e) => setStaffOnDuty(parseInt(e.target.value))}
								className="w-full h-2 rounded-lg appearance-none bg-slate-300 cursor-pointer"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* System Status Grid */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					System Status
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<StatusIndicator label="POS System" status="online" icon="💻" />
					<StatusIndicator label="Order Management" status="online" icon="📦" />
					<StatusIndicator label="Payment Gateway" status="online" icon="💳" />
					<StatusIndicator label="Database" status="online" icon="🗄️" />
					<StatusIndicator label="Kitchen Display" status="online" icon="📺" />
					<StatusIndicator label="Network" status="online" icon="🌐" />
				</div>
			</div>

			{/* Operating Hours */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Operating Hours
				</h3>
				<div className={`p-4 rounded-lg border-2 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{Object.entries(status.operatingHours).map(([day, hours]) => (
							<div key={day} className={`p-3 rounded border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>
								<p className="font-semibold capitalize text-sm">{day}</p>
								<p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
									{hours.enabled ? `${hours.open} - ${hours.close}` : 'Closed'}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Closure History */}
			{status.closureHistory.length > 0 && (
				<div>
					<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
						Recent Closure History
					</h3>
					<div className={`p-4 rounded-lg border-2 space-y-3 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
						{status.closureHistory.slice(-5).reverse().map((closure, idx) => (
							<div key={idx} className={`p-3 rounded border-l-4 ${theme === 'light' ? 'border-l-red-500 bg-red-50' : 'border-l-red-500 bg-red-900/20'}`}>
								<div className="flex justify-between items-start gap-4">
									<div className="flex-1">
										<p className={`text-sm font-semibold ${theme === 'light' ? 'text-red-900' : 'text-red-300'}`}>
											Closed: {new Date(closure.closedAt).toLocaleString()}
										</p>
										{closure.reason && (
											<p className={`text-xs mt-1 ${theme === 'light' ? 'text-red-700' : 'text-red-400'}`}>
												Reason: {closure.reason}
											</p>
										)}
										{closure.reopenedAt && (
											<p className={`text-xs mt-1 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
												Reopened: {new Date(closure.reopenedAt).toLocaleString()}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Close Store Modal */}
			{showCloseModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className={`rounded-lg p-6 max-w-sm w-full ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
						<h3 className={`text-lg font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
							Close Store?
						</h3>
						<p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
							Customers will be notified that the store is closed and won't be able to place new orders.
						</p>
						<textarea
							value={closureReason}
							onChange={(e) => setClosureReason(e.target.value)}
							placeholder="Reason for closure (optional)"
							className={`w-full p-3 rounded border mb-4 text-sm ${theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-700 border-slate-600 text-white'}`}
							rows={3}
						/>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowCloseModal(false);
									setClosureReason('');
								}}
								className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmClose}
								className="flex-1 px-4 py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
							>
								Close Store
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
