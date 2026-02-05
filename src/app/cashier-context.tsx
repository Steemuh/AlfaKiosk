'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CashierContextType {
	role: 'cashier' | 'customer' | null;
	isCashier: boolean;
	setRole: (role: 'cashier' | 'customer') => void;
}

const CashierContext = createContext<CashierContextType | undefined>(undefined);

export function CashierProvider({ children }: { children: ReactNode }) {
	const [role, setRoleState] = useState<'cashier' | 'customer' | null>(null);

	useEffect(() => {
		// Load role from localStorage on mount
		const savedRole = localStorage.getItem('userRole') as 'cashier' | 'customer' | null;
		if (savedRole) {
			setRoleState(savedRole);
		}
	}, []);

	const setRole = (newRole: 'cashier' | 'customer') => {
		setRoleState(newRole);
		localStorage.setItem('userRole', newRole);
	};

	return (
		<CashierContext.Provider value={{ role, isCashier: role === 'cashier', setRole }}>
			{children}
		</CashierContext.Provider>
	);
}

export function useCashierRole() {
	const context = useContext(CashierContext);
	if (context === undefined) {
		throw new Error('useCashierRole must be used within CashierProvider');
	}
	return context;
}
