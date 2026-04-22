'use client';

import { useState, useEffect } from 'react';
import { useCashierRole } from '../cashier-context';
import { useCashierTheme } from '../cashier-theme-context';
import { useRouter } from 'next/navigation';
import IncomingOrdersTab from '@/components/tabs/IncomingOrdersTab';
import PreparingOrdersTab from '@/components/tabs/PreparingOrdersTab';
import ReadyForPickupTab from '@/components/tabs/ReadyForPickupTab';
import StatisticsPage from '@/components/pages/StatisticsPage';
import InventoryPage from '@/components/pages/InventoryPage';
import StoreStatusPage from '@/components/pages/StoreStatusPage';

type TabType = 'incoming' | 'preparing' | 'ready';
type PageType = 'orders' | 'statistics' | 'inventory' | 'store-status';

export default function CashierContent() {
	const { isCashier } = useCashierRole();
	const { theme, toggleTheme } = useCashierTheme();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabType>('incoming');
	const [currentPage, setCurrentPage] = useState<PageType>('orders');
	const [showMenu, setShowMenu] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && !isCashier) {
			router.push('/');
		}
	}, [mounted, isCashier, router]);

	if (!mounted || !isCashier) {
		return null;
	}

	const handleSwitchRole = () => {
		localStorage.removeItem('userRole');
		router.push('/');
	};

	return (
		<div className={theme === 'light' ? 'min-h-dvh bg-white' : 'min-h-dvh bg-slate-900'}>
			{/* Top Bar */}
			<div className={`${theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700'} border-b sticky top-0 z-50`}>
				<div className="mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 sm:gap-3 min-w-0">
						{/* Hamburger Menu Button */}
						<button
							onClick={() => setShowMenu(!showMenu)}
							className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
								theme === 'light'
									? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
									: 'bg-slate-700 hover:bg-slate-600 text-white'
							}`}
							title="Navigation menu"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>

						<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<div className="min-w-0">
							<h1 className={`text-lg sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} truncate`}>
								{currentPage === 'orders' && 'Store Fulfillment'}
								{currentPage === 'statistics' && 'Statistics'}
								{currentPage === 'inventory' && 'Inventory'}
								{currentPage === 'store-status' && 'Store Status'}
							</h1>
							<p className={`text-xs sm:text-sm hidden sm:block ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>
								{currentPage === 'orders' && 'Order Management System'}
								{currentPage === 'statistics' && 'Performance Dashboard'}
								{currentPage === 'inventory' && 'Stock Management'}
								{currentPage === 'store-status' && 'System Monitoring'}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
						<button
							onClick={toggleTheme}
							title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
							className={`p-2 rounded-lg transition-colors ${
								theme === 'light'
									? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
									: 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
							}`}
						>
							{theme === 'light' ? (
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
								</svg>
							) : (
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM5.464 5.464a1 1 0 000 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 0zM5 11a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
								</svg>
							)}
						</button>

						<button
							onClick={handleSwitchRole}
							className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium flex-shrink-0 ${
								theme === 'light'
									? 'bg-slate-200 hover:bg-slate-300 text-slate-900'
									: 'bg-slate-700 hover:bg-slate-600 text-white'
							}`}
						>
							Switch
						</button>
					</div>
				</div>
			</div>

			{/* Navigation Menu Dropdown */}
			{showMenu && (
				<div className={`${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'} border-b`}>
					<div className="mx-auto px-3 sm:px-4 py-2 space-y-1">
						<button
							onClick={() => {
								setCurrentPage('orders');
								setShowMenu(false);
							}}
							className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
								currentPage === 'orders'
									? theme === 'light'
										? 'bg-emerald-100 text-emerald-900'
										: 'bg-emerald-900/30 text-emerald-300'
									: theme === 'light'
									? 'hover:bg-slate-100 text-slate-700'
									: 'hover:bg-slate-700 text-slate-300'
							}`}
						>
							<span className="flex items-center gap-2">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm8-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6a1 1 0 011-1z" />
								</svg>
								Orders
							</span>
						</button>
						<button
							onClick={() => {
								setCurrentPage('statistics');
								setShowMenu(false);
							}}
							className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
								currentPage === 'statistics'
									? theme === 'light'
										? 'bg-emerald-100 text-emerald-900'
										: 'bg-emerald-900/30 text-emerald-300'
									: theme === 'light'
									? 'hover:bg-slate-100 text-slate-700'
									: 'hover:bg-slate-700 text-slate-300'
							}`}
						>
							<span className="flex items-center gap-2">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
								</svg>
								Statistics
							</span>
						</button>
						<button
							onClick={() => {
								setCurrentPage('inventory');
								setShowMenu(false);
							}}
							className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
								currentPage === 'inventory'
									? theme === 'light'
										? 'bg-emerald-100 text-emerald-900'
										: 'bg-emerald-900/30 text-emerald-300'
									: theme === 'light'
									? 'hover:bg-slate-100 text-slate-700'
									: 'hover:bg-slate-700 text-slate-300'
							}`}
						>
							<span className="flex items-center gap-2">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
								</svg>
								Inventory
							</span>
						</button>
						<button
							onClick={() => {
								setCurrentPage('store-status');
								setShowMenu(false);
							}}
							className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
								currentPage === 'store-status'
									? theme === 'light'
										? 'bg-emerald-100 text-emerald-900'
										: 'bg-emerald-900/30 text-emerald-300'
									: theme === 'light'
									? 'hover:bg-slate-100 text-slate-700'
									: 'hover:bg-slate-700 text-slate-300'
							}`}
						>
							<span className="flex items-center gap-2">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c4.76-4.76 12.624-4.76 17.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 00-1.414-1.414 9 9 0 0112.728 0 1 1 0 00-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 00-1.415-1.415 5 5 0 017.072 0 1 1 0 00-1.415 1.415zM9.88 9.88a1 1 0 011.414 0 1 1 0 010 1.414 1 1 0 01-1.414-1.414z" clipRule="evenodd" />
								</svg>
								Store Status
							</span>
						</button>
					</div>
				</div>
			)}

			{/* Tab Navigation - Only show for Orders page */}
			{currentPage === 'orders' && (
				<div className={`sticky top-[52px] sm:top-16 z-40 overflow-x-auto ${theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-slate-800 border-slate-700'} border-b`}>
					<div className="mx-auto px-2 sm:px-4 flex">
						<TabButton
							label="Incoming"
							icon="📥"
							isActive={activeTab === 'incoming'}
							onClick={() => setActiveTab('incoming')}
							theme={theme}
						/>
						<TabButton
							label="Preparing"
							icon="⚙️"
							isActive={activeTab === 'preparing'}
							onClick={() => setActiveTab('preparing')}
							theme={theme}
						/>
						<TabButton
							label="Ready"
							icon="✅"
							isActive={activeTab === 'ready'}
							onClick={() => setActiveTab('ready')}
							theme={theme}
						/>
					</div>
				</div>
			)}

			{/* Page Content */}
			<div className="mx-auto px-3 sm:px-4 py-4 sm:py-8">
				{currentPage === 'orders' && (
					<>
						{activeTab === 'incoming' && <IncomingOrdersTab theme={theme} />}
						{activeTab === 'preparing' && <PreparingOrdersTab theme={theme} />}
						{activeTab === 'ready' && <ReadyForPickupTab theme={theme} />}
					</>
				)}
				{currentPage === 'statistics' && <StatisticsPage theme={theme} />}
				{currentPage === 'inventory' && <InventoryPage theme={theme} />}
				{currentPage === 'store-status' && <StoreStatusPage theme={theme} />}
			</div>
		</div>
	);
}

interface TabButtonProps {
	label: string;
	icon: string;
	isActive: boolean;
	onClick: () => void;
	theme: 'light' | 'dark';
}

function TabButton({ label, icon, isActive, onClick, theme }: TabButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap ${
				isActive
					? theme === 'light'
						? 'border-emerald-500 text-emerald-600 bg-white'
						: 'border-emerald-500 text-emerald-400 bg-slate-700/50'
					: theme === 'light'
					? 'border-transparent text-slate-600 hover:text-slate-800'
					: 'border-transparent text-slate-400 hover:text-slate-300'
			}`}
		>
			<span className="mr-1">{icon}</span>
			<span className="hidden sm:inline">{label}</span>
			<span className="inline sm:hidden">
				{label === 'Ready for Pickup' ? 'Ready' : label}
			</span>
		</button>
	);
}
