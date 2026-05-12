import { ArrowRight, Clock, Leaf, Heart } from "lucide-react";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { ProductListPaginatedDocument, OrderDirection, ProductOrderField } from "@saleor/shared/gql/graphql";
import Link from "next/link";
import { PullToRefresh } from "@/components/PullToRefresh";
import Image from "next/image";

export const metadata = {
	title: "Home · ALFA-C Kiosk",
	description: "Order food from ALFA-C Canteen Kiosk",
};

const SHOP_QUERY = /* GraphQL */ `
  query PopularTodayShop {
    shop {
      id
      metadata {
        key
        value
      }
    }
  }
`;

const PRODUCTS_BY_IDS_QUERY = /* GraphQL */ `
  query PopularTodayProducts($ids: [ID!], $channel: String!) {
    products(first: 12, channel: $channel, filter: { ids: $ids }) {
      edges {
        node {
          id
          name
          slug
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          thumbnail(size: 1024, format: WEBP) {
            url
            alt
          }
        }
      }
    }
  }
`;

type PopularProduct = {
	id: string;
	name: string;
	slug: string;
	pricing?: {
		priceRange?: {
			start?: {
				gross?: {
					amount?: number | null;
					currency?: string | null;
				} | null;
			} | null;
		} | null;
	} | null;
	thumbnail?: {
		url?: string | null;
		alt?: string | null;
	} | null;
};

function getMetadataValue(metadata: Array<{ key: string; value: string }> | undefined, key: string) {
  if (!metadata) {
    return null;
  }
  const match = metadata.find((entry) => entry.key === key);
  return match?.value ?? null;
}

function parsePopularIds(raw: string | null) {
  if (!raw) {
    return [] as string[];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === "string");
    }
  } catch {
    return [];
  }
  return [];
}

async function getPopularProductsFallback(channel: string): Promise<PopularProduct[]> {
	try {
		const { products } = await executeGraphQL(ProductListPaginatedDocument, {
			variables: {
				first: 6,
				channel,
				sortBy: {
					field: ProductOrderField.Name,
					direction: OrderDirection.Asc,
				},
			},
			revalidate: 60,
		});
		return products?.edges.map((edge) => edge.node) || [];
	} catch (error) {
		console.error("Failed to fetch popular products:", error);
		return [];
	}
}

async function getPopularTodayProducts(channel: string): Promise<PopularProduct[]> {
	const saleorApiUrl = process.env.SALEOR_API_URL || process.env.NEXT_PUBLIC_SALEOR_API_URL;
	const appToken = process.env.SALEOR_APP_TOKEN;

	if (!saleorApiUrl || !appToken) {
		return getPopularProductsFallback(channel);
	}

	try {
		const shopResponse = await fetch(saleorApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${appToken}`,
			},
			body: JSON.stringify({ query: SHOP_QUERY }),
			cache: "no-store",
		});

		const shopJson = await shopResponse.json();
		if (!shopResponse.ok || shopJson?.errors?.length) {
			return getPopularProductsFallback(channel);
		}

		const metadata = shopJson?.data?.shop?.metadata as Array<{ key: string; value: string }> | undefined;
		const rawIds = getMetadataValue(metadata, "popularTodayProductIds");
		const ids = parsePopularIds(rawIds).slice(0, 6);
		if (!ids.length) {
			return getPopularProductsFallback(channel);
		}

		const productsResponse = await fetch(saleorApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${appToken}`,
			},
			body: JSON.stringify({
				query: PRODUCTS_BY_IDS_QUERY,
				variables: {
					ids,
					channel,
				},
			}),
			cache: "no-store",
		});

		const productsJson = await productsResponse.json();
		if (!productsResponse.ok || productsJson?.errors?.length) {
			return getPopularProductsFallback(channel);
		}

		return (productsJson?.data?.products?.edges?.map((edge: any) => edge.node) || []) as PopularProduct[];
	} catch (error) {
		console.error("Failed to fetch popular today products:", error);
		return getPopularProductsFallback(channel);
	}
}

async function getNewProducts(channel: string) {
	try {
		const { products } = await executeGraphQL(ProductListPaginatedDocument, {
			variables: {
				first: 4,
				channel,
				sortBy: {
					field: ProductOrderField.Name,
					direction: OrderDirection.Desc,
				},
			},
			revalidate: 60,
		});
		return products?.edges.map((edge) => edge.node) || [];
	} catch (error) {
		console.error("Failed to fetch new products:", error);
		return [];
	}
}

export default async function HomePage(props: {
	params: Promise<{ channel: string }>;
}) {
	const { channel } = await props.params;

	const [popularProducts, newProducts] = await Promise.all([
		getPopularTodayProducts(channel),
		getNewProducts(channel),
	]);

	return (
		<PullToRefresh>
			<div className="min-h-screen bg-[#FFF7ED] pb-24">
				{/* Welcome Banner - Alfamart Red */}
				<div className="bg-red-500 text-white px-6 py-8 mx-6 mt-6 rounded-2xl">
					<h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
					<p className="text-base mb-6 opacity-90">Skip the line, order ahead</p>
					<Link
						href={`/${encodeURIComponent(channel)}`}
						className="inline-flex items-center gap-2 bg-white text-red-400 font-semibold px-6 py-3 rounded-full hover:bg-neutral-100 transition-colors"
					>
						Order Now
						<ArrowRight className="w-5 h-5" />
					</Link>
				</div>

				{/* Quick Actions */}
				<div className="px-6 py-6">
					<div className="grid grid-cols-2 gap-4">
						{/* Quick Pickup */}
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
							<div className="flex items-start justify-between mb-3">
								<div className="bg-blue-500 text-white p-2 rounded-lg">
									<Clock className="w-5 h-5" />
								</div>
							</div>
							<h3 className="text-sm font-semibold text-neutral-900 mb-1">Quick Pickup</h3>
							<p className="text-xs text-neutral-600">Ready in 10-15 mins</p>
						</div>

						{/* Fresh Daily */}
						<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
							<div className="flex items-start justify-between mb-3">
								<div className="bg-green-500 text-white p-2 rounded-lg">
									<Leaf className="w-5 h-5" />
								</div>
							</div>
							<h3 className="text-sm font-semibold text-neutral-900 mb-1">Fresh Daily</h3>
							<p className="text-xs text-neutral-600">Prepared fresh</p>
						</div>
					</div>
				</div>

				{/* Popular Today Section */}
				{popularProducts.length > 0 && (
					<div className="px-6 py-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-bold text-neutral-900">Popular Today</h2>
							<Link
								href={`/${encodeURIComponent(channel)}`}
								className="text-red-500 font-medium text-sm hover:text-red-600"
							>
								See All
							</Link>
						</div>
						<div className="grid grid-cols-2 gap-4">
							{popularProducts.map((product: PopularProduct) => {
								const imageUrl = product.thumbnail?.url;
								const imageAlt = product.thumbnail?.alt || product.name;
								const price = product.pricing?.priceRange?.start?.gross?.amount || 0;

								return (
									<Link
										key={product.id}
										href={`/${encodeURIComponent(channel)}/products/${product.slug}`}
										className="bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-red-300 transition-all hover:shadow-md"
									>
										<div className="relative w-full h-40 bg-neutral-100">
											{imageUrl ? (
												<Image
													src={imageUrl}
													alt={imageAlt}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
													<span className="text-neutral-500 text-sm">No image</span>
												</div>
											)}
										</div>
										<div className="p-3">
											<h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">
												{product.name}
											</h3>
											<p className="text-red-600 font-bold text-base mt-2">
												₱{price.toFixed(2)}
											</p>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				)}

				{/* New Menu Items Banner - Alfamart Yellow */}
				<div className="mx-6 my-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-neutral-900 rounded-xl px-6 py-6">
					<h3 className="text-lg font-bold mb-1">New Menu Items!</h3>
					<p className="text-sm mb-4 opacity-90">Try our freshly added dishes this week</p>
					<Link
						href={`/${encodeURIComponent(channel)}`}
						className="inline-flex items-center gap-2 bg-white text-yellow-600 font-semibold px-4 py-2 rounded-full hover:bg-neutral-100 transition-colors text-sm"
					>
						Explore Menu
						<ArrowRight className="w-4 h-4" />
					</Link>
				</div>

				{/* New Menu Items Grid */}
				{newProducts.length > 0 && (
					<div className="px-6 py-2">
						<div className="grid grid-cols-2 gap-4">
							{newProducts.map((product) => {
								const imageUrl = product.thumbnail?.url;
								const imageAlt = product.thumbnail?.alt || product.name;
								const price = product.pricing?.priceRange?.start?.gross?.amount || 0;

								return (
									<Link
										key={product.id}
										href={`/${encodeURIComponent(channel)}/products/${product.slug}`}
										className="bg-white rounded-xl overflow-hidden border border-neutral-100 hover:border-red-300 transition-all hover:shadow-md"
									>
										<div className="relative w-full h-40 bg-neutral-100">
											{imageUrl ? (
												<Image
													src={imageUrl}
													alt={imageAlt}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
													<span className="text-neutral-500 text-sm">No image</span>
												</div>
											)}
										</div>
										<div className="p-3">
											<h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">
												{product.name}
											</h3>
											<p className="text-red-600 font-bold text-base mt-2">
												₱{price.toFixed(2)}
											</p>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				)}

				{/* About This App Section */}
				<div className="px-6 py-8">
					<div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
						<h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
							<Heart className="w-5 h-5 text-red-500" />
							About This App
						</h2>
						<p className="text-sm text-neutral-700 leading-relaxed mb-4">
							Welcome to the <strong>ALFA-C Canteen Kiosk App</strong>! This application was developed 
							by the <strong>Alfamart IT Department</strong> to provide a seamless and convenient 
							food ordering experience for our employees.
						</p>
						<p className="text-sm text-neutral-700 leading-relaxed">
							Simply browse the menu, add items to your cart, and place your order. 
							You&apos;ll receive a notification when your food is ready for pickup!
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 text-center border-t border-neutral-200 mt-6">
					<p className="text-xs text-neutral-500">Developed by Alfamart IT Department</p>
					<p className="text-xs text-neutral-500 mt-1">© 2026 All Rights Reserved</p>
				</div>
			</div>
		</PullToRefresh>
	);
}
