'use client';

import { useState } from 'react';

interface StoreStatusPageProps {
	theme: 'light' | 'dark';
}

export default function StoreStatusPage({ theme }: StoreStatusPageProps) {
	const [storeOpen, setStoreOpen] = useState(true);

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
					: 'bg-red-900/30 border-red-700 text-red-300',
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

			{/* Store Open/Close */}
			<div
				className={`p-6 rounded-lg border-2 ${
					theme === 'light'
						? 'bg-white border-slate-200'
						: 'bg-slate-800 border-slate-700'
				}`}
			>
				<div className="flex items-center justify-between">
					<div>
						<h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
							Store Status
						</h3>
						<p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
							{storeOpen ? 'Store is currently open' : 'Store is currently closed'}
						</p>
					</div>
					<button
						onClick={() => setStoreOpen(!storeOpen)}
						className={`px-6 py-2 rounded-lg font-semibold transition-all ${
							storeOpen
								? 'bg-emerald-500 hover:bg-emerald-600 text-white'
								: 'bg-slate-400 hover:bg-slate-500 text-white'
						}`}
					>
						{storeOpen ? 'Close Store' : 'Open Store'}
					</button>
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

			{/* Quick Actions */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Quick Actions
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<button
						className={`p-4 rounded-lg border-2 transition-colors text-left ${
							theme === 'light'
								? 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-900'
								: 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50 text-blue-300'
						}`}
					>
						<p className="font-semibold">📢 Announcements</p>
						<p className="text-xs mt-1 opacity-75">Make store announcements</p>
					</button>
					<button
						className={`p-4 rounded-lg border-2 transition-colors text-left ${
							theme === 'light'
								? 'bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-900'
								: 'bg-purple-900/30 border-purple-700 hover:bg-purple-900/50 text-purple-300'
						}`}
					>
						<p className="font-semibold">🧾 Daily Report</p>
						<p className="text-xs mt-1 opacity-75">View daily sales report</p>
					</button>
					<button
						className={`p-4 rounded-lg border-2 transition-colors text-left ${
							theme === 'light'
								? 'bg-orange-50 border-orange-300 hover:bg-orange-100 text-orange-900'
								: 'bg-orange-900/30 border-orange-700 hover:bg-orange-900/50 text-orange-300'
						}`}
					>
						<p className="font-semibold">🔧 Maintenance</p>
						<p className="text-xs mt-1 opacity-75">System maintenance mode</p>
					</button>
					<button
						className={`p-4 rounded-lg border-2 transition-colors text-left ${
							theme === 'light'
								? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100 text-indigo-900'
								: 'bg-indigo-900/30 border-indigo-700 hover:bg-indigo-900/50 text-indigo-300'
						}`}
					>
						<p className="font-semibold">👥 Staff</p>
						<p className="text-xs mt-1 opacity-75">Manage staff members</p>
					</button>
				</div>
			</div>
		</div>
	);
}
