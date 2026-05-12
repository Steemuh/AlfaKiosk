"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ShoppingCartIcon } from "lucide-react";

type CartSummary = {
	lineCount: number;
	checkoutUrl: string;
};

export function CartBadgeButton({ channel }: { channel: string }) {
	const [summary, setSummary] = useState<CartSummary>({
		lineCount: 0,
		checkoutUrl: "/checkout",
	});

	const loadSummary = async () => {
		try {
			const response = await fetch(`/api/checkout/summary?channel=${encodeURIComponent(channel)}`, {
				cache: "no-store",
			});
			if (!response.ok) {
				return;
			}
			const data = (await response.json()) as Partial<CartSummary> & { ok?: boolean };
			setSummary({
				lineCount: typeof data.lineCount === "number" ? data.lineCount : 0,
				checkoutUrl: data.checkoutUrl || "/checkout",
			});
		} catch {
			// Ignore fetch errors; keep last known state.
		}
	};

	useEffect(() => {
		loadSummary();

		const handleUpdate = () => {
			loadSummary();
		};

		window.addEventListener("cart:updated", handleUpdate);
		window.addEventListener("focus", handleUpdate);

		return () => {
			window.removeEventListener("cart:updated", handleUpdate);
			window.removeEventListener("focus", handleUpdate);
		};
	}, [channel]);

	return (
		<Link href={summary.checkoutUrl} className="relative flex items-center" data-testid="CartNavItem">
			<ShoppingCartIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
			{summary.lineCount > 0 ? (
				<div
					className={clsx(
						"absolute bottom-0 right-0 -mb-2 -mr-2 flex h-4 flex-col items-center justify-center rounded bg-neutral-900 text-xs font-medium text-white",
						summary.lineCount > 9 ? "w-[3ch]" : "w-[2ch]",
					)}
				>
					{summary.lineCount}{" "}
					<span className="sr-only">
						item{summary.lineCount > 1 ? "s" : ""} in cart, view bag
					</span>
				</div>
			) : (
				<span className="sr-only">0 items in cart</span>
			)}
		</Link>
	);
}
