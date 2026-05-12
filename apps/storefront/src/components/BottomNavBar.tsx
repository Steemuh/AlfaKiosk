"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Utensils, ShoppingCart, ClipboardList } from "lucide-react";
import clsx from "clsx";

interface BottomNavBarProps {
	channel: string;
}

export const BottomNavBar = ({ channel }: BottomNavBarProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const [cartCount, setCartCount] = useState(0);
	const [cartUrl, setCartUrl] = useState("/checkout");

	const loadCartSummary = async () => {
		try {
			const response = await fetch(`/api/checkout/summary?channel=${encodeURIComponent(channel)}`, {
				cache: "no-store",
			});
			if (!response.ok) {
				return;
			}
			const data = (await response.json()) as { lineCount?: number; checkoutUrl?: string };
			setCartCount(typeof data.lineCount === "number" ? data.lineCount : 0);
			setCartUrl(data.checkoutUrl || "/checkout");
		} catch {
			// Ignore fetch errors; keep last known state.
		}
	};

	useEffect(() => {
		loadCartSummary();

		const handleUpdate = () => {
			loadCartSummary();
		};

		window.addEventListener("cart:updated", handleUpdate);
		window.addEventListener("focus", handleUpdate);

		return () => {
			window.removeEventListener("cart:updated", handleUpdate);
			window.removeEventListener("focus", handleUpdate);
		};
	}, [channel]);

	// `getCheckoutUrl` removed — use `cartUrl` state (updated by `loadCartSummary`)

	const navItems: Array<{
		label: string;
		icon: typeof Home;
		path: string;
		getPath?: () => string;
		badge?: number;
	}> = [
		{
			label: "Home",
			icon: Home,
			path: `/${channel}/home`,
		},
		{
			label: "Menu",
			icon: Utensils,
			path: `/${channel}`,
		},
		{
			label: "Cart",
			icon: ShoppingCart,
			path: `/checkout`,
			getPath: () => cartUrl || "/checkout",
			badge: cartCount,
		},
		{
			label: "Orders",
			icon: ClipboardList,
			path: `/${channel}/orders`,
		},
	];

	const isActive = (path: string) => {
		if (path === `/${channel}`) {
			return pathname === `/${channel}` || pathname?.startsWith(`/${channel}/products`) || pathname?.startsWith(`/${channel}/categories`);
		}
		if (path === "/checkout") {
			return pathname === "/checkout";
		}
		return pathname === path || pathname?.startsWith(path);
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)]">
			<div className="mx-auto flex h-14 max-w-md items-center justify-around">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);
					return (
						<button
							key={item.label}
							onClick={() => router.push(item.getPath ? item.getPath() : item.path)}
							className={clsx(
								"flex h-full w-full flex-col items-center justify-center gap-0.5 transition-colors",
								active
									? "text-emerald-600"
									: "text-neutral-500 hover:text-neutral-700"
							)}
						>
							<span className="relative">
								<Icon className={clsx("h-5 w-5", active && "stroke-[2.5]")} />
								{item.badge && item.badge > 0 ? (
									<span
										className={clsx(
											"absolute -right-2 -top-2 flex h-4 items-center justify-center rounded bg-neutral-900 text-[10px] font-semibold text-white",
											item.badge > 9 ? "w-[3ch]" : "w-[2ch]",
										)}
									>
										{item.badge}
									</span>
								) : null}
							</span>
							<span className={clsx("text-[10px] leading-none", active ? "font-semibold" : "font-medium")}>
								{item.label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
};
