export interface PendingPayrexOrderItem {
	name: string;
	quantity: number;
	price: number;
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
	sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(payload));
};

export const readPendingPayrexOrder = (): PendingPayrexOrderPayload | null => {
	const rawValue = sessionStorage.getItem(PENDING_ORDER_KEY);
	if (!rawValue) {
		return null;
	}

	try {
		return JSON.parse(rawValue) as PendingPayrexOrderPayload;
	} catch {
		return null;
	}
};

export const clearPendingPayrexOrder = () => {
	sessionStorage.removeItem(PENDING_ORDER_KEY);
};