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
		return pathname === path || pathname?.startsWith(path);
	};

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
			<div className="flex items-center justify-around h-16">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);
					return (
						<button
							key={item.label}
							onClick={() => router.push(item.path)}
							className={clsx(
								"flex flex-col items-center justify-center w-full h-full transition-colors",
								active
									? "text-emerald-600"
									: "text-neutral-500 hover:text-neutral-700"
							)}
						>
							<Icon className={clsx("h-6 w-6", active && "stroke-[2.5]")} />
							<span className={clsx("text-xs mt-1", active ? "font-semibold" : "font-medium")}>
								{item.label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
};
