"use server";

import { getServerAuthClient } from "./config";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { CheckoutAddLineDocument } from "@saleor/shared/gql/graphql";
import * as Checkout from "@saleor/shared/lib/checkout";
import { headers } from "next/headers";

type StoreStatusResponse = {
	isOpen: boolean;
	closureReason?: string;
};

async function getStoreStatus(): Promise<StoreStatusResponse | null> {
	const headerList = await headers();
	const origin = headerList.get("origin");
	const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
	const proto = headerList.get("x-forwarded-proto") ?? "http";
	const baseUrl = origin ?? (host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL ?? "");

	if (!baseUrl) {
		return null;
	}

	try {
		const response = await fetch(`${baseUrl}/api/store-status`, { cache: "no-store" });
		if (!response.ok) {
			return null;
		}
		return (await response.json()) as StoreStatusResponse;
	} catch {
		return null;
	}
}

export async function logout() {
	"use server";
	(await getServerAuthClient()).signOut();
}

export async function addToCart(checkoutId: string, variantId: string, quantity: number = 1) {
	"use server";

	try {
		const result = await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkoutId,
				productVariantId: variantId,
				quantity: quantity,
			},
			cache: "no-cache",
		});

		if (result.checkoutLinesAdd?.errors?.length) {
			throw new Error(result.checkoutLinesAdd.errors[0].message || "Unknown error");
		}

		return { success: true, checkout: result.checkoutLinesAdd?.checkout };
	} catch (error) {
		console.error("Add to cart error:", error);
		return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function addItemToCart(channel: string, variantId: string) {
	"use server";

	try {
		console.log(`[addItemToCart] Adding variant: ${variantId} to channel: ${channel}`);
		
		const storeStatus = await getStoreStatus();
		if (storeStatus && storeStatus.isOpen === false) {
			const reason = storeStatus.closureReason?.trim();
			return {
				success: false,
				error: reason ? `Store is currently closed: ${reason}` : "Store is currently closed",
			};
		}

		// Create or find checkout
		const existingCheckoutId = await Checkout.getIdFromCookies(channel);
		console.log(`[addItemToCart] Existing checkout ID: ${existingCheckoutId}`);

		const checkout = await Checkout.findOrCreate({
			checkoutId: existingCheckoutId,
			channel: channel,
		});

		if (!checkout) {
			throw new Error("Failed to create checkout");
		}

		console.log(`[addItemToCart] Checkout created/found: ${checkout.id}`);

		// Save checkout ID to cookie
		await Checkout.saveIdToCookie(channel, checkout.id);

		// Add item to checkout
		const result = await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkout.id,
				productVariantId: variantId,
			},
			cache: "no-cache",
		});

		console.log(`[addItemToCart] CheckoutAddLineDocument result:`, result);

		if (result.checkoutLinesAdd?.errors?.length) {
			console.error(`[addItemToCart] GraphQL errors:`, result.checkoutLinesAdd.errors);
			throw new Error(result.checkoutLinesAdd.errors[0].message || "Unknown error");
		}

		console.log(`[addItemToCart] Success! Returning checkout ID: ${checkout.id}`);
		return { success: true, checkoutId: checkout.id };
	} catch (error) {
		console.error("Add to cart error:", error);
		return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
