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
	status: 'new' | 'incoming' | 'preparing' | 'ready';
	createdAt: number;
	totalPrice: number;
}

interface OrderStore {
	orders: Order[];
	addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
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
