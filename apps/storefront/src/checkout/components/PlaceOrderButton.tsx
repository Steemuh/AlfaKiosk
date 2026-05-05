'use client';

import { useEffect, useState } from 'react';
import PlaceOrderModal from '@/checkout/components/PlaceOrderModal';
import { useCheckout } from '@/checkout/hooks/useCheckout';

export default function PlaceOrderButton({ storeOpen = true }: { storeOpen?: boolean }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { checkout } = useCheckout();

	// Get cart items from checkout
	const cartItems = checkout?.lines?.map((line: any) => ({
		name: line.variant?.product?.name || 'Unknown Item',
		quantity: line.quantity,
		price: parseFloat(String(line.unitPrice?.gross?.amount || '0')),
	})) || [];

	const totalPrice = parseFloat(String(checkout?.totalPrice?.gross?.amount || '0'));

	const paymentStatus = sessionStorage.getItem('payrexPaymentStatus');
	const payrexCheckoutId = sessionStorage.getItem('payrexCheckoutId');
	const paidAt = sessionStorage.getItem('payrexPaidAt');
	const returnFlag = sessionStorage.getItem('payrexReturnToCheckout');
	const paidAtMs = paidAt ? Date.parse(paidAt) : 0;
	const isRecentPayment = paidAtMs > 0 && Date.now() - paidAtMs < 30 * 60 * 1000;
	const effectiveCheckoutId = payrexCheckoutId || checkout?.id || '';
	const paymentReady = paymentStatus === 'success' && effectiveCheckoutId === checkout?.id && isRecentPayment;

	useEffect(() => {
		if (!returnFlag || returnFlag !== '1') return;
		if (paymentReady && !isModalOpen) {
			sessionStorage.removeItem('payrexReturnToCheckout');
			setIsModalOpen(true);
			return;
		}

		let attempts = 0;
		const intervalId = window.setInterval(() => {
			attempts += 1;
			const latestStatus = sessionStorage.getItem('payrexPaymentStatus');
			const latestCheckoutId = sessionStorage.getItem('payrexCheckoutId') || checkout?.id || '';
			const latestPaidAt = sessionStorage.getItem('payrexPaidAt');
			const latestPaidAtMs = latestPaidAt ? Date.parse(latestPaidAt) : 0;
			const latestRecent = latestPaidAtMs > 0 && Date.now() - latestPaidAtMs < 30 * 60 * 1000;
			const latestReady = latestStatus === 'success' && latestCheckoutId === checkout?.id && latestRecent;

			if (latestReady) {
				sessionStorage.removeItem('payrexReturnToCheckout');
				setIsModalOpen(true);
				window.clearInterval(intervalId);
				return;
			}

			if (attempts >= 12) {
				window.clearInterval(intervalId);
			}
		}, 500);

		return () => window.clearInterval(intervalId);
	}, [paymentReady, returnFlag, isModalOpen, checkout?.id]);

	const handlePlaceOrder = () => {
		if (!storeOpen) {
			alert('Sorry, the store is currently closed. We are not accepting orders at this time.');
			return;
		}
		if (!cartItems.length) {
			alert('Your cart is empty. Please add items before placing an order.');
			return;
		}
		if (!paymentReady) return;
		setIsModalOpen(true);
	};

	return (
		<>
			{paymentReady && (
				<button
					onClick={handlePlaceOrder}
					disabled={!cartItems.length || !storeOpen}
					className={`mt-4 w-full px-6 py-3 font-bold rounded-lg shadow-lg transition-all ${
						!storeOpen
							? 'bg-slate-400 text-white cursor-not-allowed opacity-60'
							: 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white hover:shadow-xl'
					}`}
					title={
						!storeOpen
							? 'Store is closed - cannot place orders'
						: 'Place your order for pickup'
					}
				>
					<svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-6-4m6 4l6-4" />
					</svg>
					{!storeOpen ? 'Store is Closed' : 'Place Order for Pickup'}
				</button>
			)}

			<PlaceOrderModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				cartItems={cartItems}
				totalPrice={totalPrice}
			/>
		</>
	);
}
