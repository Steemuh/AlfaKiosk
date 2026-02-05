'use client';

import { Suspense } from 'react';
import OrderConfirmationContent from './OrderConfirmationContent';

export default function OrderConfirmationPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-white">Loading order details...</p>
				</div>
			</div>
		}>
			<OrderConfirmationContent />
		</Suspense>
	);
}
