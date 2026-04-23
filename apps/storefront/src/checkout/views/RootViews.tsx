import { Suspense, useState, useEffect } from "react";
import { Checkout, CheckoutSkeleton } from "@/checkout/views/Checkout";
import { OrderConfirmation, OrderConfirmationSkeleton } from "@/checkout/views/OrderConfirmation";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { PaymentProcessingScreen } from "@/checkout/sections/PaymentSection/PaymentProcessingScreen";

export const RootViews = () => {
	const orderId = getQueryParams().orderId;
	const [storeOpen, setStoreOpen] = useState(true);
	const [loadingStatus, setLoadingStatus] = useState(true);

	useEffect(() => {
		const checkStoreStatus = async () => {
			try {
				const response = await fetch('/api/store-status');
				if (response.ok) {
					const data = await response.json();
					setStoreOpen(data.isOpen ?? true);
				}
			} catch (error) {
				console.error('Failed to check store status:', error);
				// Default to open if we can't check
				setStoreOpen(true);
			} finally {
				setLoadingStatus(false);
			}
		};

		checkStoreStatus();
		// Check store status every 30 seconds
		const interval = setInterval(checkStoreStatus, 30000);
		return () => clearInterval(interval);
	}, []);

	if (orderId) {
		return (
			<Suspense fallback={<OrderConfirmationSkeleton />}>
				<OrderConfirmation />
			</Suspense>
		);
	}

	return (
		<div>
			{!loadingStatus && !storeOpen && (
				<div className="w-full bg-red-100 border-b-4 border-red-500 text-red-700 px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<span className="text-2xl">🔴</span>
							<div>
								<p className="font-bold">Store is Currently Closed</p>
								<p className="text-sm">We're not accepting orders at this time. Please try again later.</p>
							</div>
						</div>
					</div>
				</div>
			)}
			<PaymentProcessingScreen>
				<Suspense fallback={<CheckoutSkeleton />}>
					<Checkout storeOpen={storeOpen} />
				</Suspense>
			</PaymentProcessingScreen>
		</div>
	);
};
