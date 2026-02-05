'use client';

import { Suspense } from 'react';
import CashierContent from './CashierContent';

export default function CashierDashboard() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-slate-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-white">Loading cashier dashboard...</p>
				</div>
			</div>
		}>
			<CashierContent />
		</Suspense>
	);
}
