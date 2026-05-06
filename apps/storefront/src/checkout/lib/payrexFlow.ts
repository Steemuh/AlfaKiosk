export interface PendingPayrexOrderItem {
	name: string;
	quantity: number;
	price: number;
	image?: string;
}

export interface PendingPayrexOrderPayload {
	checkoutId: string;
	customerName: string;
	customerEmail: string;
	pickupTime: string;
	currency: string;
	totalPrice: number;
	items: PendingPayrexOrderItem[];
	createdAt: string;
}

const PENDING_ORDER_KEY = 'payrexPendingOrder';

export const savePendingPayrexOrder = (payload: PendingPayrexOrderPayload) => {
	console.debug('[PayRex Flow] Saving pending order', {
		checkoutId: payload.checkoutId,
		customerName: payload.customerName,
		customerEmail: payload.customerEmail,
		pickupTime: payload.pickupTime,
		totalPrice: payload.totalPrice,
		itemCount: payload.items.length,
		createdAt: payload.createdAt,
	});
	sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(payload));
	console.debug('[PayRex Flow] Pending order saved', {
		storageKey: PENDING_ORDER_KEY,
		checkoutId: payload.checkoutId,
	});
};

export const readPendingPayrexOrder = (): PendingPayrexOrderPayload | null => {
	const rawValue = sessionStorage.getItem(PENDING_ORDER_KEY);
	if (!rawValue) {
		console.debug('[PayRex Flow] No pending order found in sessionStorage', {
			storageKey: PENDING_ORDER_KEY,
		});
		return null;
	}

	try {
		const parsed = JSON.parse(rawValue) as PendingPayrexOrderPayload;
		console.debug('[PayRex Flow] Pending order loaded', {
			checkoutId: parsed.checkoutId,
			customerName: parsed.customerName,
			customerEmail: parsed.customerEmail,
			pickupTime: parsed.pickupTime,
			totalPrice: parsed.totalPrice,
			itemCount: parsed.items.length,
			createdAt: parsed.createdAt,
		});
		return parsed;
	} catch {
		console.warn('[PayRex Flow] Failed to parse pending order from sessionStorage', {
			storageKey: PENDING_ORDER_KEY,
		});
		return null;
	}
};

export const clearPendingPayrexOrder = () => {
	console.debug('[PayRex Flow] Clearing pending order', {
		storageKey: PENDING_ORDER_KEY,
	});
	sessionStorage.removeItem(PENDING_ORDER_KEY);
};