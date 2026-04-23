"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Utensils, ShoppingCart, ClipboardList } from "lucide-react";
import clsx from "clsx";

interface BottomNavBarProps {
	channel: string;
}

export const BottomNavBar = ({ channel }: BottomNavBarProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const getCheckoutUrl = () => {
		if (typeof document === "undefined") {
			return "/checkout";
		}

		const cookieName = `checkoutId-${channel}=`;
		const matchingCookie = document.cookie
			.split(";")
			.map((cookie) => cookie.trim())
			.find((cookie) => cookie.startsWith(cookieName));

		if (!matchingCookie) {
			return "/checkout";
		}

		const checkoutId = decodeURIComponent(matchingCookie.slice(cookieName.length));
		return checkoutId ? `/checkout?checkout=${checkoutId}` : "/checkout";
	};

	const navItems = [
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
			getPath: getCheckoutUrl,
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
							<Icon className={clsx("h-5 w-5", active && "stroke-[2.5]")} />
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
