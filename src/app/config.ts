import { SaleorAuthClient } from "@saleor/auth-sdk";
// import { getNextServerCookiesStorageAsync } from "@saleor/auth-sdk/next/server";
import { invariant } from "ts-invariant";

export const ProductsPerPage = 12;

const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

export const DefaultChannelSlug =
	process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? "default-channel";

export const getServerAuthClient = async () => {
	// const nextServerCookiesStorage = await getNextServerCookiesStorageAsync();
	const storage = {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {},
		length: 0,
		clear: () => {},
		key: () => null,
	};
	return new SaleorAuthClient({
		saleorApiUrl,
		storage,
		// refreshTokenStorage: nextServerCookiesStorage,
		// accessTokenStorage: nextServerCookiesStorage,
	});
};
