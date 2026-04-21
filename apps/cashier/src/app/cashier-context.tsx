'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CashierContextType {
	role: 'cashier' | 'customer' | null;
	isCashier: boolean;
	setRole: (role: 'cashier' | 'customer') => void;
}

const CashierContext = createContext<CashierContextType | undefined>(undefined);

export function CashierProvider({ children }: { children: ReactNode }) {
	const [role, setRoleState] = useState<'cashier' | 'customer' | null>('cashier');

	const setRole = (newRole: 'cashier' | 'customer') => {
		setRoleState(newRole);
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