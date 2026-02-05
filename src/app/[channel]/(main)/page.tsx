import { ProductListDocument, CategoriesListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";
import { CanteenSidebar } from "@/ui/components/CanteenSidebar";

export const metadata = {
	title: "Alfamart Food Kiosk - Order Now",
	description: "Quick and easy food ordering from Alfamart canteen",
};

export default async function Page(props: { params: Promise<{ channel: string }> }) {
	const params = await props.params;

	// Fetch all products and categories
	const [productsData, categoriesData] = await Promise.all([
		executeGraphQL(ProductListDocument, {
			variables: {
				first: 100, // Fetch more products
				channel: params.channel,
			},
			revalidate: 60,
		}),
		executeGraphQL(CategoriesListDocument, {
			variables: {
				first: 100,
			},
			revalidate: 60,
		}),
	]);

	const products = productsData.products?.edges.map(({ node: product }) => product) || [];
	const categories = categoriesData.categories?.edges.map(({ node: category }) => ({
		name: category.name,
		slug: (category as any).slug,
	})) || [];

	// Define the chronological order for categories (matching sidebar order)
	const CATEGORY_ORDER = [
		"Rice Meals/ Viands",
		"Vegetables/ Side Dishes",
		"Snacks / Light Meals",
		"Beverages",
		"Desserts",
		"Add-ons / Extras"
	];

	// Keywords for matching categories to display names (ordered by specificity)
	const getCategoryDisplayName = (categoryName: string): string => {
		const name = categoryName.toLowerCase();

		// Check most specific categories first to avoid false matches
		if (name.includes("snack") || name.includes("kwek") || name.includes("turon") ||
		    name.includes("banana") || name.includes("cucumber") || name.includes("fish") ||
		    (name.includes("light") && name.includes("meal"))) {
			return "Snacks / Light Meals";
		}
		if (name.includes("beverage") || name.includes("drink") || name.includes("juice") ||
		    name.includes("soda") || name.includes("water")) {
			return "Beverages";
		}
		if (name.includes("dessert") || name.includes("cake") || name.includes("pastry") ||
		    name.includes("ice cream") || name.includes("sweet") || name.includes("halo-halo")) {
			return "Desserts";
		}
		if (name.includes("vegetable") || name.includes("gulay") || name.includes("side") ||
		    name.includes("dish") || name.includes("ensalada") || name.includes("soup")) {
			return "Vegetables/ Side Dishes";
		}
		if (name.includes("rice") || name.includes("meal") || name.includes("ulam") ||
		    name.includes("viand") || name.includes("silog") || name.includes("pork") ||
		    name.includes("chicken") || name.includes("beef") || name.includes("fish")) {
			return "Rice Meals/ Viands";
		}
		if (name.includes("add-on") || name.includes("extra") || name.includes("addon") ||
		    name.includes("condiment") || name.includes("sauce")) {
			return "Add-ons / Extras";
		}

		return categoryName; // fallback to original name
	};

	// Create a map of category name to slug for easier lookup
	const categoryNameToSlug = categories.reduce((acc, cat) => {
		acc[cat.name] = cat.slug;
		return acc;
	}, {} as Record<string, string>);

	// Group products by category display name to ensure consistent ordering
	const productsByCategory = products.reduce((acc, product) => {
		const categoryName = product.category?.name || 'Uncategorized';
		const displayName = getCategoryDisplayName(categoryName);
		const categorySlug = categoryNameToSlug[categoryName] || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

		if (!acc[displayName]) {
			acc[displayName] = {
				name: displayName,
				slug: categorySlug,
				products: [],
			};
		}
		acc[displayName].products.push(product);
		return acc;
	}, {} as Record<string, { name: string; slug: string; products: typeof products }>);

	// Sort categories in the same chronological order as the sidebar
	const sortedCategoryEntries = CATEGORY_ORDER
		.filter(displayName => productsByCategory[displayName]) // Only include categories that have products
		.map(displayName => [productsByCategory[displayName].slug, productsByCategory[displayName]] as const);

	return (
		<div className="flex">
			{/* Left Sidebar with Categories */}
			{categories.length > 0 && <CanteenSidebar categories={categories} channel={params.channel} />}

			{/* Main Content Area */}
			<main className="flex-1 ml-24">
				{sortedCategoryEntries.length > 0 ? (
					sortedCategoryEntries.map(([categorySlug, categoryData]) => (
						<section key={categorySlug} id={categorySlug} className="p-8 pb-16 scroll-mt-16">
							<h2 className="mb-6 text-2xl font-semibold text-neutral-900">{categoryData.name}</h2>
							<ProductList products={categoryData.products} channel={params.channel} />
						</section>
					))
				) : (
					<section className="p-8">
						<p className="text-neutral-500">No products available at the moment.</p>
					</section>
				)}
			</main>
	</div>
	);
}
