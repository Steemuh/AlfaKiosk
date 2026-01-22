import { useEffect, useMemo } from "react";

import { type Checkout, useCheckoutQuery } from "@/checkout/graphql";
import { extractCheckoutIdFromUrl } from "@/checkout/lib/utils/url";
import { useCheckoutUpdateStateActions } from "@/checkout/state/updateStateStore";

export const useCheckout = ({ pause = false }: { pause?: boolean } = {}) => {
	const id = useMemo(() => {
		const checkoutIdFromUrl = extractCheckoutIdFromUrl();
		
		// If we have an ID from the URL, use it
		if (checkoutIdFromUrl) {
			return checkoutIdFromUrl;
		}
		
		// Otherwise, try to get from cookies (client-side)
		try {
			const cookieString = document.cookie
				.split("; ")
				.find(row => row.startsWith("checkoutId="));
			if (cookieString) {
				return cookieString.split("=")[1];
			}
		} catch (e) {
			// Silently fail if we can't access cookies
		}
		
		return "";
	}, []);
	const { setLoadingCheckout } = useCheckoutUpdateStateActions();

	const [{ data, fetching, stale }, refetch] = useCheckoutQuery({
		variables: { id, languageCode: "EN_US" },
		pause: pause || !id,
	});

	useEffect(() => setLoadingCheckout(fetching || stale), [fetching, setLoadingCheckout, stale]);

	return useMemo(
		() => ({ checkout: data?.checkout as Checkout, fetching: fetching || stale, refetch }),
		[data?.checkout, fetching, refetch, stale],
	);
};
