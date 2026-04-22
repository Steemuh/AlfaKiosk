'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface CashierThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const CashierThemeContext = createContext<CashierThemeContextType | undefined>(undefined);

export function CashierThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('dark');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Load theme from localStorage
		const savedTheme = localStorage.getItem('cashierTheme') as Theme | null;
		if (savedTheme) {
			setTheme(savedTheme);
		}
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme((prev) => {
			const newTheme = prev === 'dark' ? 'light' : 'dark';
			localStorage.setItem('cashierTheme', newTheme);
			return newTheme;
		});
	};

	if (!mounted) {
		return children;
	}

	return (
		<CashierThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</CashierThemeContext.Provider>
	);
}

export function useCashierTheme() {
	const context = useContext(CashierThemeContext);
	if (context === undefined) {
		// Return default values on server or during SSR
		if (typeof window === 'undefined') {
			return {
				theme: 'dark' as Theme,
				toggleTheme: () => {},
			};
		}
		throw new Error('useCashierTheme must be used within CashierThemeProvider');
	}
	return context;
}
