'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

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
	totalPrice: number;
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	clearCart: () => void;
}

export const CartContext = React.createContext<CartContextType>({
	items: [],
	totalPrice: 0,
	addItem: () => { throw new Error('useCart must be used within CartProvider'); },
	removeItem: () => { throw new Error('useCart must be used within CartProvider'); },
	clearCart: () => { throw new Error('useCart must be used within CartProvider'); },
});

interface CartProviderProps {
	children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
	const [items, setItems] = useState<CartItem[]>([]);

	const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	const addItem = useCallback((item: CartItem) => {
		setItems((prev) => {
			const existing = prev.find((i) => i.id === item.id);
			if (existing) {
				return prev.map((i) =>
					i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
				);
			}
			return [...prev, item];
		});
	}, []);

	const removeItem = useCallback((id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
	}, []);

	const clearCart = useCallback(() => {
		setItems([]);
	}, []);

	const value = useMemo(
		() => ({ items, totalPrice, addItem, removeItem, clearCart }),
		[items, totalPrice, addItem, removeItem, clearCart]
	);

	return (
		<CartContext.Provider value={value}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	return context;
}
