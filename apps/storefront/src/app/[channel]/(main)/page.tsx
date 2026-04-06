export const metadata = {
	title: "Alfamart Food Kiosk - Order Now",
	description: "Quick and easy food ordering from Alfamart canteen",
};

export default async function Page(props: { params: Promise<{ channel: string }> }) {
	const { channel } = await props.params;

	return (
		<div style={{ padding: 40 }}>
			<h1>CHANNEL PAGE IS RUNNING</h1>
			<p>Channel: {channel}</p>
		</div>
	);
}



// import { executeGraphQL } from "@saleor/shared/lib/graphql";
// import {
// 	CategoriesListDocument,
// 	ProductListDocument,
// 	type ProductListItemFragment,
// } from "@saleor/shared/gql/graphql";
// import { ProductList } from "@saleor/shared/ui/components/ProductList";
// import { CanteenSidebar } from "@saleor/shared/ui/components/CanteenSidebar";

// export const metadata = {
// 	title: "Alfamart Food Kiosk - Order Now",
// 	description: "Quick and easy food ordering from Alfamart canteen",
// };

// type CategoryEntry = {
// 	name: string;
// 	slug: string;
// 	products: ProductListItemFragment[];
// };
// <h1>TEST PUSH NOW</h1>

// export default async function Page(props: { params: Promise<{ channel: string }> }) {
//   const { channel } = await props.params;

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>CHANNEL PAGE IS RUNNING</h1>
//       <p>Channel: {channel}</p>
//     </div>
//   );
// }

// export default async function Page(props: { params: Promise<{ channel: string }> }) {
// 	const { channel } = await props.params;

// 	try {
// 		const [productsData, categoriesData] = await Promise.all([
// 			executeGraphQL(ProductListDocument, {
// 				variables: {
// 					first: 100,
// 					channel,
// 				},
// 				revalidate: 60,
// 			}),
// 			executeGraphQL(CategoriesListDocument, {
// 				variables: {
// 					first: 100,
// 				},
// 				revalidate: 60,
// 			}),
// 		]);

// 		const products = productsData.products?.edges.map(({ node }) => node) || [];
// 		const categories =
// 			categoriesData.categories?.edges.map(({ node }) => ({
// 				name: node.name,
// 				slug: node.slug,
// 			})) || [];

// 		const productsByCategory = products.reduce<Record<string, CategoryEntry>>((acc, product) => {
// 			const category = product.category;
// 			if (!category) {
// 				return acc;
// 			}

// 			if (!acc[category.slug]) {
// 				acc[category.slug] = { name: category.name, slug: category.slug, products: [] };
// 			}

// 			acc[category.slug].products.push(product);
// 			return acc;
// 		}, {});

// 		const sortedCategoryEntries = categories
// 			.filter((category) => productsByCategory[category.slug])
// 			.map((category) => [category.slug, productsByCategory[category.slug]] as const);

// 		const sidebarCategories = categories.filter((category) => productsByCategory[category.slug]);

// 		return (
// 			<div className="flex">
// 				{sidebarCategories.length > 0 && (
// 					<CanteenSidebar categories={sidebarCategories} channel={channel} />
// 				)}
// 				<main className="flex-1 ml-[var(--canteen-sidebar-width)]">
// 					{sortedCategoryEntries.length > 0 ? (
// 						sortedCategoryEntries.map(([categorySlug, categoryData]) => (
// 							<section key={categorySlug} id={categorySlug} className="p-8 pb-16 scroll-mt-16">
// 								<h2 className="mb-6 text-2xl font-semibold text-neutral-900">
// 									{categoryData.name}
// 								</h2>
// 								<ProductList products={categoryData.products} channel={channel} />
// 							</section>
// 						))
// 					) : (
// 						<section className="p-8">
// 							<p className="text-neutral-500">No products available at the moment.</p>
// 						</section>
// 					)}
// 				</main>
// 			</div>
// 		);
// 	} catch (error) {
// 		console.error("CHANNEL PAGE ERROR:", error);

// 		return (
// 			<div className="p-8">
// 				<h1 className="mb-4 text-2xl font-semibold">Unable to load menu</h1>
// 				<p className="text-neutral-600">
// 					There was a problem loading products for this channel: <strong>{channel}</strong>.
// 				</p>
				

// 			</div>
// 		);
// 	}
// }