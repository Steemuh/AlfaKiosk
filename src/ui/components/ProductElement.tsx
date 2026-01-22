"use client";

import { useState } from "react";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import { Minus, Plus, Check } from "lucide-react";
import { addItemToCart } from "@/app/actions";

import type { ProductListItemFragment } from "@/gql/graphql";
import { formatMoneyRange } from "@/lib/utils";

export function ProductElement({
	product,
	loading,
	priority,
	channel,
}: { product: ProductListItemFragment } & { loading: "eager" | "lazy"; priority?: boolean; channel: string }) {
	const [quantity, setQuantity] = useState(0);
	const [isAdding, setIsAdding] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const handleIncrease = async () => {
		// Get the first available variant
		const firstVariant = product.variants?.[0];

		if (!firstVariant) {
			alert("No variants available for this product");
			return;
		}

		setIsAdding(true);
		try {
			const result = await addItemToCart(channel, firstVariant.id);

			if (result.success && result.checkoutId) {
				setQuantity(prev => prev + 1);
				// Show success notification
				setShowSuccess(true);
				// Hide notification after 2 seconds
				setTimeout(() => setShowSuccess(false), 2000);
			} else {
				alert(`Failed to add to cart: ${result.error}`);
			}
		} catch (error) {
			console.error('Error in handleIncrease:', error);
			alert("Failed to add to cart");
		} finally {
			setIsAdding(false);
		}
	};

	const handleDecrease = () => {
		if (quantity > 0) {
			setQuantity(prev => prev - 1);
			// Note: In a real app, you'd also need to remove from cart
			// For now, we're just managing local state
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

				{/* Quantity Selector */}
				<div className="mt-3 flex items-center justify-center rounded-md border border-neutral-200 bg-white p-1.5 min-h-[2rem]">
					<div className="flex items-center gap-1.5">
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
							disabled={isAdding}
							className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Increase quantity"
						>
							{isAdding ? "..." : <Plus className="h-3 w-3" />}
						</button>
					</div>
				</div>

				{/* Success Notification */}
				{showSuccess && (
					<div className="mt-2 flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-xs font-medium text-green-700 animate-pulse">
						<Check className="h-4 w-4" />
						Added to cart!
					</div>
				)}
			</div>
		</li>
	);
}
