"use client";

import { useEffect, useState } from "react";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { ProductImageWrapper } from "@saleor/shared/ui/atoms/ProductImageWrapper";
import { Minus, Plus, Check } from "lucide-react";
import { addItemToCart } from "@/app/actions";

import type { ProductListItemFragment } from "@saleor/shared/gql/graphql";
import { formatMoneyRange } from "@saleor/shared/lib/utils";

export function ProductElement({
	product,
	loading,
	priority,
	channel,
}: { product: ProductListItemFragment } & { loading: "eager" | "lazy"; priority?: boolean; channel: string }) {
	const [quantity, setQuantity] = useState(0);
	const [isAdding, setIsAdding] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [closedMessage, setClosedMessage] = useState<string | null>(null);
	const [outOfStock, setOutOfStock] = useState(false);
	// Find the first variant with available quantity
	const firstAvailableVariant = product.variants?.find(
		(v) => v.quantityAvailable && v.quantityAvailable > 0
	);
	const variantId = firstAvailableVariant?.id ?? null;

	// Debug logging
	if (typeof window !== "undefined") {
		console.log(`[ProductElement] ${product.name}:`, {
			variantId,
			firstAvailableVariant,
			variants: product.variants,
			hasVariants: !!product.variants && product.variants.length > 0,
		});
	}

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

			if (result.success && result.checkoutId) {
				setQuantity((prev) => {
					const next = prev + 1;
					writeStoredQuantity(channel, variantId, next);
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
		<li data-testid="ProductElement" className="relative">
			<div className="group">
				<LinkWithChannel href={`/products/${product.slug}`} key={product.id}>
					<div>
						{product?.thumbnail?.url && (
							<ProductImageWrapper
								loading={loading}
								src={product.thumbnail.url}
								alt={product.thumbnail.alt ?? ""}
								width={512}
								height={512}
								sizes={"512px"}
								priority={priority}
							/>
						)}
						<div className="mt-3 flex flex-col gap-1">
							<h3 className="text-sm font-semibold text-neutral-900 leading-snug" data-testid="ProductElement_Name">{product.name}</h3>
							<p className="text-sm font-medium text-neutral-900" data-testid="ProductElement_PriceRange">
								{formatMoneyRange({
									start: product?.pricing?.priceRange?.start?.gross,
									stop: product?.pricing?.priceRange?.stop?.gross,
								})}
							</p>
							<p className="text-xs text-neutral-500" data-testid="ProductElement_Category">
								{product.category?.name}
							</p>
						</div>
					</div>
				</LinkWithChannel>

				<div className="mt-3 flex items-center justify-center rounded-md border border-neutral-200 bg-white p-1.5 min-h-[2rem]">
					<div className="flex items-center gap-4">
						<button
							onClick={handleDecrease}
							disabled={quantity <= 0}
							className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Decrease quantity"
						>
							<Minus className="h-3 w-3" />
						</button>
						<span className="min-w-[1.5rem] text-center text-xs font-medium">{quantity}</span>
						<button
							onClick={handleIncrease}
							disabled={isAdding || !variantId || outOfStock}
							className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Increase quantity"
							title={!variantId ? "Out of stock" : ""}
						>
							{isAdding ? "..." : <Plus className="h-3 w-3" />}
						</button>
					</div>
				</div>

				{showSuccess && (
					<div className="mt-2 flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-xs font-medium text-green-700 animate-pulse">
						<Check className="h-4 w-4" />
						Added to cart!
					</div>
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
		</li>
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
