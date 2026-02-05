'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
	id: string;
	name: string;
	quantity: number;
	price: number;
	image?: string;
	variant?: string;
}

interface CartContextType {
	items: CartItem[];
	setItems: (items: CartItem[]) => void;
	totalPrice: number;
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	const addItem = (item: CartItem) => {
		setItems((prev) => {
			const existing = prev.find((i) => i.id === item.id);
			if (existing) {
				return prev.map((i) =>
					i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
				);
			}
			return [...prev, item];
		});
	};

	const removeItem = (id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
	};

	const clearCart = () => {
		setItems([]);
	};

	return (
		<CartContext.Provider value={{ items, setItems, totalPrice, addItem, removeItem, clearCart }}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart must be used within CartProvider');
	}
	return context;
}
