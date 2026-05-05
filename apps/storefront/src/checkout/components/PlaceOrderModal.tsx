'use client';

import { useEffect, useState } from 'react';
import { useCheckout } from '@/checkout/hooks/useCheckout';
import { LanguageCodeEnum } from '@saleor/shared/gql/graphql';
import {
	type CountryCode,
	useCheckoutBillingAddressUpdateMutation,
	useCheckoutDeliveryMethodUpdateMutation,
	useCheckoutEmailUpdateMutation,
	useCheckoutShippingAddressUpdateMutation,
} from '@/checkout/graphql';
import { isValidEmail } from '@/checkout/lib/utils/common';
import { savePendingPayrexOrder } from '@/checkout/lib/payrexFlow';

interface PlaceOrderModalProps {
	isOpen: boolean;
	onClose: () => void;
	cartItems?: Array<{ name: string; quantity: number; price: number }>;
	totalPrice?: number;
}

export default function PlaceOrderModal({
	isOpen,
	onClose,
	cartItems = [],
	totalPrice = 0,
}: PlaceOrderModalProps) {
	// Calculate pickup time: current time + 45 minutes
	const getDefaultPickupTime = () => {
		const now = new Date();
		now.setMinutes(now.getMinutes() + 45);
		return now.toTimeString().slice(0, 5); // HH:MM format
	};

	const [customerName, setCustomerName] = useState('');
	const [email, setEmail] = useState('');
	const [pickupTime, setPickupTime] = useState(getDefaultPickupTime());
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { checkout } = useCheckout();
	const [, updateDeliveryMethod] = useCheckoutDeliveryMethodUpdateMutation();
	const [, updateEmail] = useCheckoutEmailUpdateMutation();
	const [, updateBillingAddress] = useCheckoutBillingAddressUpdateMutation();
	const [, updateShippingAddress] = useCheckoutShippingAddressUpdateMutation();

	useEffect(() => {
		if (!isOpen) return;
		const storedName = sessionStorage.getItem('payrexCustomerName') || sessionStorage.getItem('customerName') || '';
		const storedEmail = sessionStorage.getItem('payrexCustomerEmail') || sessionStorage.getItem('customerEmail') || '';
		if (storedName) {
			setCustomerName(storedName);
		}
		if (storedEmail) {
			setEmail(storedEmail);
		}
	}, [isOpen]);

	const submitOrder = async () => {
		if (!customerName.trim()) {
			alert('Please enter your name');
			return;
		}

		if (!(await isValidEmail(email))) {
			alert('Please enter a valid email address');
			return;
		}

		setIsSubmitting(true);

		try {
			if (!checkout) {
				alert('Checkout not ready yet. Please try again.');
				return;
			}

			if (!checkout.email || checkout.email !== email.trim()) {
				const emailResult = await updateEmail({
					checkoutId: checkout.id,
					email: email.trim(),
					languageCode: 'EN_US',
				});
				const emailErrors = emailResult.data?.checkoutEmailUpdate?.errors ?? [];
				if (emailErrors.length > 0) {
					alert(emailErrors.map((error) => error.message).filter(Boolean).join('\n') || 'Failed to set email.');
					return;
				}
			}

			const [firstName, ...rest] = customerName.trim().split(' ');
			const lastName = rest.length > 0 ? rest.join(' ') : '';
			const billingAddress = {
				firstName: firstName || 'Customer',
				lastName: lastName || 'Customer',
				streetAddress1: 'SM Retail Corporate Office, J.W. Diokno Blvd. cor. Bayshore Ave.',
				city: 'Pasay City',
				country: 'PH' as CountryCode,
				postalCode: '1300',
				phone: '+639171234567',
			};

			const billingResult = await updateBillingAddress({
				checkoutId: checkout.id,
				billingAddress,
				languageCode: 'EN_US',
			});
			const billingErrors = billingResult.data?.checkoutBillingAddressUpdate?.errors ?? [];
			if (billingErrors.length > 0) {
				alert(billingErrors.map((error) => error.message).filter(Boolean).join('\n') || 'Failed to set billing address.');
				return;
			}

			if (checkout.isShippingRequired) {
				const shippingResult = await updateShippingAddress({
					checkoutId: checkout.id,
					shippingAddress: billingAddress,
					languageCode: 'EN_US',
				});
				const shippingErrors = shippingResult.data?.checkoutShippingAddressUpdate?.errors ?? [];
				if (shippingErrors.length > 0) {
					alert(shippingErrors.map((error) => error.message).filter(Boolean).join('\n') || 'Failed to set shipping address.');
					return;
				}
			}

			if (checkout.isShippingRequired && !checkout.deliveryMethod?.id) {
				const defaultMethodId = checkout.shippingMethods?.[0]?.id;
				if (!defaultMethodId) {
					alert('No delivery method available. Please configure a shipping method in Saleor.');
					return;
				}

				const deliveryResult = await updateDeliveryMethod({
					checkoutId: checkout.id,
					deliveryMethodId: defaultMethodId,
					languageCode: LanguageCodeEnum.EnUs,
				});
				const deliveryErrors = deliveryResult.data?.checkoutDeliveryMethodUpdate?.errors ?? [];
				if (deliveryErrors.length > 0) {
					alert(deliveryErrors.map((error) => error.message).filter(Boolean).join('\n') || 'Failed to set delivery method.');
					return;
				}
			}

			savePendingPayrexOrder({
				checkoutId: checkout.id,
				customerName: customerName.trim(),
				customerEmail: email.trim(),
				pickupTime,
				currency: checkout.totalPrice?.gross?.currency || 'PHP',
				totalPrice: Number(totalPrice || 0),
				items: cartItems,
				createdAt: new Date().toISOString(),
			});

			const appUrl = window.location.origin;
			const response = await fetch('/api/payrex/create-payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					checkoutId: checkout.id,
					amount: Number(totalPrice || 0),
					currency: checkout.totalPrice?.gross?.currency || 'PHP',
					customerEmail: email.trim(),
					customerName: customerName.trim(),
					pickupTime,
					description: `Checkout ${checkout.id}`,
					items: cartItems,
					successUrl: `${appUrl}/payment/success?checkoutId=${checkout.id}`,
					failureUrl: `${appUrl}/payment/failed?checkoutId=${checkout.id}`,
					cancelUrl: `${appUrl}/payment/failed?checkoutId=${checkout.id}`,
				}),
			});

			const data = await response.json();
			if (!response.ok || !data?.checkoutUrl) {
				const message = data?.details || data?.error || 'Failed to start PayRex payment.';
				alert(String(message));
				return;
			}

			sessionStorage.setItem('customerName', customerName.trim());
			sessionStorage.setItem('customerEmail', email.trim());
			sessionStorage.setItem('payrexPaymentStatus', 'pending');
			sessionStorage.setItem('payrexCheckoutId', checkout.id);
			if (data.sessionId) {
				sessionStorage.setItem('payrexSessionId', String(data.sessionId));
			}
			window.location.href = data.checkoutUrl;
		} catch (error) {
			console.error('Checkout completion failed:', error);
			alert('Failed to start payment. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
			void submitOrder();
	};

		if (!isOpen) return null;

	return (
		<div className={`fixed inset-0 bg-black/50 z-50 items-center justify-center p-4 ${isOpen ? 'flex' : 'hidden'}`}>
			<div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold text-slate-900 mb-4">Place Order</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Customer Name */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Your Name
						</label>
						<input
							type="text"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Enter your name"
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
							disabled={isSubmitting}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="customer@example.com"
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
							disabled={isSubmitting}
							required
						/>
					</div>

					{/* Pickup Time */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Preferred Pickup Time
						</label>
						<input
							type="time"
							value={pickupTime}
							onChange={(e) => setPickupTime(e.target.value)}
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
							disabled={isSubmitting}
						/>
					</div>

					{/* Order Summary */}
					<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
						<h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
						<div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
							{cartItems.length > 0 ? (
								cartItems.map((item, idx) => (
									<div key={idx} className="flex justify-between text-sm">
										<span className="text-slate-700">
											{item.name} x{item.quantity}
										</span>
										<span className="text-slate-900 font-medium">
											₱{(item.price * item.quantity).toFixed(2)}
										</span>
									</div>
								))
							) : (
								<div className="text-sm text-slate-600">No items in cart</div>
							)}
						</div>
						<div className="border-t border-slate-300 pt-2">
							<div className="flex justify-between">
								<span className="font-semibold text-slate-900">Total:</span>
								<span className="font-bold text-emerald-600">
									₱{(totalPrice || 0).toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || cartItems.length === 0}
							className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50"
						>
							{isSubmitting ? 'Processing...' : 'Pay & Place Order'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}