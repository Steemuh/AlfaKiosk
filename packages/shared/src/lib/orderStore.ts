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
	pickupTime: string;
	items: OrderItem[];
	status: 'new' | 'incoming' | 'preparing' | 'ready' | 'completed';
	createdAt: number;
	totalPrice: number;
}

interface OrderStore {
	orders: Order[];
	addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
	setOrders: (orders: Order[]) => void;
	updateOrderStatus: (orderId: string, status: Order['status']) => void;
	removeOrder: (orderId: string) => void;
	getOrdersByStatus: (status: Order['status']) => Order[];
	getAllOrders: () => Order[];
}

export const useOrderStore = create<OrderStore>()(
	persist(
		(set, get) => ({
			orders: [],

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
				set((state) => {
					const orderMap = new Map(state.orders.map((order) => [order.id, order]));

					orders.forEach((order) => {
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

			updateOrderStatus: (orderId, status) => {
				set((state) => ({
					orders: state.orders.map((order) =>
						order.id === orderId ? { ...order, status } : order
					),
				}));
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
