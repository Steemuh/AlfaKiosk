'use client';

import { useState, useEffect } from 'react';
import { useStoreStatusStore } from '../../lib/storeStatusStore';

interface StoreStatusPageProps {
	theme: 'light' | 'dark';
}

type PopularProduct = {
	id: string;
	name: string;
	slug: string;
	thumbnail?: { url?: string; alt?: string } | null;
};

export default function StoreStatusPage({ theme }: StoreStatusPageProps) {
	const { status, setStoreOpen, setStaffOnDuty } = useStoreStatusStore();
	const [showCloseModal, setShowCloseModal] = useState(false);
	const [closureReason, setClosureReason] = useState('');
	const [mounted, setMounted] = useState(false);
	const [popularSearch, setPopularSearch] = useState('');
	const [popularResults, setPopularResults] = useState<PopularProduct[]>([]);
	const [selectedPopularIds, setSelectedPopularIds] = useState<string[]>([]);
	const [popularLoading, setPopularLoading] = useState(false);
	const [popularError, setPopularError] = useState<string | null>(null);
	const [popularSaving, setPopularSaving] = useState(false);
	const [popularCatalog, setPopularCatalog] = useState<Record<string, PopularProduct>>({});

	useEffect(() => {
		setMounted(true);
	}, []);

	const mergePopularCatalog = (products: PopularProduct[]) => {
		setPopularCatalog((prev) => {
			const next = { ...prev };
			products.forEach((product) => {
				next[product.id] = product;
			});
			return next;
		});
	};

	useEffect(() => {
		if (!mounted) {
			return;
		}

		let isActive = true;

		const loadPopular = async () => {
			setPopularLoading(true);
			try {
				const response = await fetch('/api/popular-today');
				const data = await response.json();
				if (!response.ok || !data?.ok) {
					throw new Error(data?.error || 'Failed to load popular items');
				}
				if (isActive) {
					const nextProducts = Array.isArray(data.products) ? data.products : [];
					setSelectedPopularIds(Array.isArray(data.selectedIds) ? data.selectedIds : []);
					setPopularResults(nextProducts);
					mergePopularCatalog(nextProducts);
					setPopularError(null);
				}
			} catch (error) {
				if (isActive) {
					setPopularError(error instanceof Error ? error.message : 'Failed to load popular items');
				}
			} finally {
				if (isActive) {
					setPopularLoading(false);
				}
			}
		};

		loadPopular();

		return () => {
			isActive = false;
		};
	}, [mounted]);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		const handler = window.setTimeout(async () => {
			if (!popularSearch.trim()) {
				setPopularResults([]);
				return;
			}

			try {
				setPopularLoading(true);
				const response = await fetch(`/api/popular-today/products?search=${encodeURIComponent(popularSearch.trim())}`);
				const data = await response.json();
				if (!response.ok || !data?.ok) {
					throw new Error(data?.error || 'Failed to search products');
				}
				const nextProducts = Array.isArray(data.products) ? data.products : [];
				setPopularResults(nextProducts);
				mergePopularCatalog(nextProducts);
				setPopularError(null);
			} catch (error) {
				setPopularError(error instanceof Error ? error.message : 'Failed to search products');
			} finally {
				setPopularLoading(false);
			}
		}, 350);

		return () => {
			window.clearTimeout(handler);
		};
	}, [popularSearch, mounted]);

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

	const togglePopularSelection = (id: string) => {
		setSelectedPopularIds((current) => {
			if (current.includes(id)) {
				return current.filter((entry) => entry !== id);
			}
			if (current.length >= 6) {
				return current;
			}
			return [...current, id];
		});
	};

	const handleSavePopular = async () => {
		try {
			setPopularSaving(true);
			const response = await fetch('/api/popular-today', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: selectedPopularIds }),
			});
			const data = await response.json();
			if (!response.ok || !data?.ok) {
				throw new Error(data?.error || 'Failed to save popular items');
			}
			setPopularError(null);
		} catch (error) {
			setPopularError(error instanceof Error ? error.message : 'Failed to save popular items');
		} finally {
			setPopularSaving(false);
		}
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


			{/* Popular Today Manager */}
			<div>
				<h3 className={`font-semibold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
					Popular Today Manager
				</h3>
				<div className={`p-4 rounded-lg border-2 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col sm:flex-row sm:items-center gap-3">
							<input
								type="text"
								value={popularSearch}
								onChange={(event) => setPopularSearch(event.target.value)}
								placeholder="Search products to feature"
								className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${theme === 'light' ? 'border-slate-200 bg-white text-slate-900' : 'border-slate-600 bg-slate-900 text-white'}`}
							/>
							<div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
								Selected {selectedPopularIds.length} / 6
							</div>
						</div>

						{popularError && (
							<p className="text-sm text-red-500">{popularError}</p>
						)}

						{popularLoading && (
							<p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
								Loading...
							</p>
						)}

						<div>
							<p className={`text-xs font-semibold uppercase tracking-wide ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
								Selected Items
							</p>
							{selectedPopularIds.length === 0 ? (
								<p className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
									No popular items selected yet.
								</p>
							) : (
								<div className="mt-3 space-y-2">
									{selectedPopularIds.map((id) => {
										const product = popularCatalog[id];
										return (
											<div
												key={id}
												className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
													theme === 'light'
														? 'border-emerald-200 bg-emerald-50'
														: 'border-emerald-700 bg-emerald-900/30'
												}`}
											>
												<div className="flex items-center gap-3 min-w-0">
													<div className="h-10 w-10 rounded-md bg-slate-200 overflow-hidden flex-shrink-0">
														{product?.thumbnail?.url ? (
															<img src={product.thumbnail.url} alt={product.thumbnail.alt || product.name} className="h-full w-full object-cover" />
														) : null}
													</div>
													<div className="min-w-0">
														<p className={`text-sm font-semibold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
															{product?.name ?? 'Selected item'}
														</p>
														<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
															{product?.slug ?? id}
														</p>
													</div>
												</div>
												<button
													onClick={() => togglePopularSelection(id)}
													className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
														theme === 'light'
															? 'bg-white text-red-600 hover:bg-red-50'
															: 'bg-slate-800 text-red-300 hover:bg-slate-700'
													}`}
												>
													Remove
												</button>
											</div>
										);
									})}
								</div>
							)}
						</div>

						<div className="mt-4">
							<p className={`text-xs font-semibold uppercase tracking-wide ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
								Search Results
							</p>
							<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
							{popularResults.map((product) => {
								const isSelected = selectedPopularIds.includes(product.id);
								return (
									<button
										key={product.id}
										className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
											isSelected
												? theme === 'light'
													? 'border-emerald-400 bg-emerald-50'
													: 'border-emerald-500 bg-emerald-900/30'
											: theme === 'light'
											? 'border-slate-200 bg-white hover:bg-slate-50'
											: 'border-slate-700 bg-slate-900 hover:bg-slate-800'
										}`}
										onClick={() => togglePopularSelection(product.id)}
										disabled={!isSelected && selectedPopularIds.length >= 6}
									>
										<div className="h-12 w-12 rounded-md bg-slate-200 overflow-hidden flex-shrink-0">
											{product.thumbnail?.url ? (
												<img src={product.thumbnail.url} alt={product.thumbnail.alt || product.name} className="h-full w-full object-cover" />
											) : null}
										</div>
										<div className="min-w-0">
											<p className={`text-sm font-semibold truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
												{product.name}
											</p>
											<p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
												{product.slug}
											</p>
										</div>
											<div className="ml-auto">
												<span className={`text-xs font-semibold ${isSelected ? 'text-emerald-600' : theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
													{isSelected ? 'Selected' : 'Tap to add'}
												</span>
											</div>
									</button>
								);
							})}
							</div>
						</div>

						<div className="flex items-center justify-end">
							<button
								onClick={handleSavePopular}
								disabled={popularSaving}
								className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
									popularSaving
										? 'bg-slate-300 text-slate-600'
										: 'bg-emerald-600 text-white hover:bg-emerald-700'
								}`}
							>
								{popularSaving ? 'Saving...' : 'Save Popular Today'}
							</button>
						</div>
					</div>
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
