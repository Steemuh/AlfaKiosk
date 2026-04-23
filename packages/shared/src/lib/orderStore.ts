import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
	name: string;
	quantity: number;
	price: number;
}

export interface Order {
	id: string;
	orderId: string;
	customerName: string;
	customerEmail?: string;
	pickupTime: string;
	items: OrderItem[];
	status: 'new' | 'incoming' | 'preparing' | 'ready' | 'completed';
	createdAt: number;
	totalPrice: number;
}

export interface OrderListEntry {
	id: string;
	orderId: string;
	customerName: string;
	customerEmail?: string;
	items?: OrderItem[];
	action: 'rejected' | 'handed-over';
	timestamp: number;
	notes?: string;
}

interface OrderStore {
	orders: Order[];
	orderList: OrderListEntry[];
	addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
	setOrders: (orders: Order[]) => void;
	replaceOrders: (orders: Order[]) => void;
	updateOrderStatus: (orderId: string, status: Order['status']) => void;
	addOrderListEntry: (entry: Omit<OrderListEntry, 'id' | 'timestamp'> & { timestamp?: number }) => void;
	clearOrderList: () => void;
	removeOrder: (orderId: string) => void;
	getOrdersByStatus: (status: Order['status']) => Order[];
	getAllOrders: () => Order[];
}

export const useOrderStore = create<OrderStore>()(
	persist(
		(set, get) => ({
			orders: [],
			orderList: [],

			addOrder: (order) => {
				const newOrder: Order = {
					...order,
					id: Math.random().toString(36).substring(2, 11),
					createdAt: Date.now(),
				};
				set((state) => ({
					orders: [newOrder, ...state.orders],
				}));
			},

			setOrders: (orders) => {
				const safeOrders = Array.isArray(orders) ? orders : [];
				if (!Array.isArray(orders)) {
					console.warn('[orderStore] setOrders received non-array input, using empty array fallback.');
				}

				set((state) => {
					const orderMap = new Map(state.orders.map((order) => [order.id, order]));

					safeOrders.forEach((order) => {
						const existing = orderMap.get(order.id);
						
						// If order exists locally, preserve its status to prevent reverting
						// local status changes (e.g., when order moved from incoming -> preparing -> ready)
						if (existing) {
							orderMap.set(order.id, {
								...order,
								status: existing.status,  // Always use local status for existing orders
							});
						} else {
							// New order from API, use its status
							orderMap.set(order.id, order);
						}
					});

					const mergedOrders = Array.from(orderMap.values()).sort((a, b) => b.createdAt - a.createdAt);
					return { orders: mergedOrders };
				});
			},

			replaceOrders: (orders) => {
				const safeOrders = Array.isArray(orders) ? orders : [];
				if (!Array.isArray(orders)) {
					console.warn('[orderStore] replaceOrders received non-array input, using empty array fallback.');
				}

				set(() => ({
					orders: [...safeOrders].sort((a, b) => b.createdAt - a.createdAt),
				}));
			},

			updateOrderStatus: (orderId, status) => {
				set((state) => ({
					orders: state.orders.map((order) =>
						order.id === orderId ? { ...order, status } : order
					),
				}));
			},

			addOrderListEntry: (entry) => {
				const eventTimestamp = typeof entry.timestamp === 'number' ? entry.timestamp : Date.now();
				set((state) => ({
					orderList: [
						{
							...entry,
							id: Math.random().toString(36).substring(2, 11),
							timestamp: eventTimestamp,
						},
						...state.orderList,
					],
				}));
			},

			clearOrderList: () => {
				set({ orderList: [] });
			},

			removeOrder: (orderId) => {
				set((state) => ({
					orders: state.orders.filter((order) => order.id !== orderId),
				}));
			},

			getOrdersByStatus: (status) => {
				return get().orders.filter((order) => order.status === status);
			},

			getAllOrders: () => {
				return get().orders;
			},
		}),
		{
			name: 'order-store',
		}
	)
);
