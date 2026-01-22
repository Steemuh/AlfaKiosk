"use server";

import { getServerAuthClient } from "@/app/config";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";

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
		// Create or find checkout
		const existingCheckoutId = await Checkout.getIdFromCookies(channel);

		const checkout = await Checkout.findOrCreate({
			checkoutId: existingCheckoutId,
			channel: channel,
		});

		if (!checkout) {
			throw new Error("Failed to create checkout");
		}

		// Save checkout ID to cookie
		await Checkout.saveIdToCookie(channel, checkout.id);

		// Add item to checkout
		await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkout.id,
				productVariantId: variantId,
			},
			cache: "no-cache",
		});

		return { success: true, checkoutId: checkout.id };
	} catch (error) {
		console.error("Add to cart error:", error);
		return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
