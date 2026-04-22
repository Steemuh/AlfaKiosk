import { Inter } from "next/font/google";
import "./globals.css";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { CashierProvider } from "./cashier-context";
import { CashierThemeProvider } from "./cashier-theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Alfamart Cashier Dashboard",
	description: "Cashier order management dashboard",
};

export default function RootLayout(props: { children: ReactNode }) {
	const { children } = props;

	return (
		<html lang="en" className="min-h-dvh">
			<body className={`${inter.className} min-h-dvh`}>
				<CashierProvider>
					<CashierThemeProvider>
						{children}
					</CashierThemeProvider>
				</CashierProvider>
			</body>
		</html>
	);
}
