"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { addItemToCart } from "@/app/actions";

export function ProductDetailActions({ channel, variantId }: { channel: string; variantId?: string | null }) {
	const [quantity, setQuantity] = useState(0);
	const [isAdding, setIsAdding] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [closedMessage, setClosedMessage] = useState<string | null>(null);
	const [outOfStock, setOutOfStock] = useState(false);

	useEffect(() => {
		if (!variantId) {
			setQuantity(0);
			return;
		}

		const syncQuantity = () => {
			setQuantity(readStoredQuantity(channel, variantId));
		};

		syncQuantity();
		window.addEventListener("cart:updated", syncQuantity);

		return () => {
			window.removeEventListener("cart:updated", syncQuantity);
		};
	}, [channel, variantId]);

	const handleIncrease = async () => {
		if (!variantId) {
			alert("This product is out of stock");
			return;
		}

		setIsAdding(true);
		try {
			const result = await addItemToCart(channel, variantId);
			if (result.success) {
				if (result.checkoutId && typeof window !== "undefined") {
					try {
						const cookieName = `checkoutId-${channel}`;
						document.cookie = `${cookieName}=${encodeURIComponent(result.checkoutId)};path=/`;
					} catch (e) {
						console.warn("Failed to set checkoutId cookie on client:", e);
					}
				}
				setQuantity((prev) => {
					const next = prev + 1;
					if (variantId) {
						writeStoredQuantity(channel, variantId, next);
					}
					return next;
				});
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("cart:updated"));
				}
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 2000);
			} else {
				const message = typeof result.error === "string" ? result.error : "Failed to add to cart";
				// If backend reports no stock, mark locally as out of stock and show message
				if (/could not add items|only \d+ remaining in stock/i.test(message)) {
					setOutOfStock(true);
					alert("This variant is out of stock.");
					return;
				}
				if (message.toLowerCase().includes("store is currently closed")) {
					setClosedMessage(message);
				} else {
					alert(`Failed to add to cart: ${message}`);
				}
			}
		} catch (error) {
			console.error("Error in handleIncrease:", error);
			alert("Failed to add to cart");
		} finally {
			setIsAdding(false);
		}
	};

	const handleDecrease = () => {
		if (quantity > 0 && variantId) {
			setQuantity((prev) => {
				const next = Math.max(0, prev - 1);
				writeStoredQuantity(channel, variantId, next);
				return next;
			});
			if (typeof window !== "undefined") {
				window.dispatchEvent(new Event("cart:updated"));
			}
		}
	};

	return (
		<div className="mt-4">
			{!variantId || outOfStock ? (
				<div className="flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-3">
					<span className="text-sm font-semibold text-red-600">Out of Stock</span>
				</div>
			) : (
				<>
					<div className="flex items-center justify-center rounded-md border border-neutral-200 bg-white p-2">
						<div className="flex items-center gap-4">
							<button
								onClick={handleDecrease}
								disabled={quantity <= 0}
								className="flex h-8 w-8 items-center justify-center rounded border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Decrease quantity"
							>
								<Minus className="h-4 w-4" />
							</button>
							<span className="min-w-[1.5rem] text-center text-sm font-semibold">{quantity}</span>
							<button
								onClick={handleIncrease}
								disabled={isAdding}
								className="flex h-8 w-8 items-center justify-center rounded border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Increase quantity"
							>
								{isAdding ? "..." : <Plus className="h-4 w-4" />}
							</button>
						</div>
					</div>

					{showSuccess && (
						<div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-green-100 px-3 py-2 text-xs font-medium text-green-700 animate-pulse">
							<Check className="h-4 w-4" />
							Added to cart!
						</div>
					)}
				</>
			)}
			{closedMessage && (
				<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4">
					<div className="w-full max-w-sm rounded-xl bg-white p-5 text-neutral-900 shadow-xl">
						<h3 className="text-base font-semibold">Store Closed</h3>
						<p className="mt-2 text-sm text-neutral-600">{closedMessage}</p>
						<button
							onClick={() => setClosedMessage(null)}
							className="mt-4 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
						>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

function getStorageKey(channel: string) {
	return `cartQuantities-${channel}`;
}

function readStoredQuantity(channel: string, variantId: string) {
	if (typeof window === "undefined") {
		return 0;
	}

	try {
		const raw = window.localStorage.getItem(getStorageKey(channel));
		if (!raw) {
			return 0;
		}
		const data = JSON.parse(raw) as Record<string, number>;
		return Math.max(0, data[variantId] ?? 0);
	} catch {
		return 0;
	}
}

function writeStoredQuantity(channel: string, variantId: string, quantity: number) {
	if (typeof window === "undefined") {
		return;
	}

	try {
		const raw = window.localStorage.getItem(getStorageKey(channel));
		const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
		if (quantity > 0) {
			data[variantId] = quantity;
		} else {
			delete data[variantId];
		}
		window.localStorage.setItem(getStorageKey(channel), JSON.stringify(data));
	} catch {
		// Ignore storage write errors.
	}
}
