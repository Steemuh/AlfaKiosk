"use client";

import {
	Coffee,
	Leaf,
	Cake,
	Wine,
	Utensils,
	Apple,
	Package,
	Grid,
	LucideIcon,
} from "lucide-react";

interface Category {
	name: string;
	slug: string;
}

interface CanteenSidebarProps {
	categories: Category[];
	channel: string;
	onCategorySelect?: (slug: string) => void;
}

// Define the specific chronological order for categories with precise matching keywords
const CATEGORY_CONFIG = [
	{ displayName: "Rice Meals/ Viands", keywords: ["rice", "meal", "ulam", "viand"] },
	{ displayName: "Vegetables/ Side Dishes", keywords: ["vegetable", "gulay", "side", "dish"] },
	{ displayName: "Snacks / Light Meals", keywords: ["snack", "light", "meal"] },
	{ displayName: "Beverages", keywords: ["beverage", "drink"] },
	{ displayName: "Desserts", keywords: ["dessert", "cake", "pastry"] },
	{ displayName: "Add-ons / Extras", keywords: ["add-on", "extra", "addon"] }
];

// Map category display names to icons
const getCategoryIcon = (displayName: string): LucideIcon => {
	switch (displayName) {
		case "Rice Meals/ Viands":
			return Utensils;
		case "Vegetables/ Side Dishes":
			return Leaf;
		case "Snacks / Light Meals":
			return Package;
		case "Beverages":
			return Wine;
		case "Desserts":
			return Cake;
		case "Add-ons / Extras":
			return Grid;
		default:
			return Grid; // default icon
	}
};

// Create ordered categories with display names
const createOrderedCategories = (categories: Category[]) => {
	const usedSlugs = new Set<string>();

	return CATEGORY_CONFIG.map(config => {
		// Find matching category using keywords for more precise matching
		const matchingCategory = categories.find(cat => {
			const categoryName = cat.name.toLowerCase();
			return config.keywords.some(keyword =>
				categoryName.includes(keyword.toLowerCase())
			);
		});

		if (matchingCategory && !usedSlugs.has(matchingCategory.slug)) {
			usedSlugs.add(matchingCategory.slug);
			return {
				...matchingCategory,
				displayName: config.displayName
			};
		}

		// Create a unique slug for fallback categories
		let uniqueSlug = config.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		let counter = 1;
		while (usedSlugs.has(uniqueSlug)) {
			uniqueSlug = `${config.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
			counter++;
		}
		usedSlugs.add(uniqueSlug);

		// Fallback: create a placeholder category with unique slug
		return {
			name: config.displayName,
			slug: uniqueSlug,
			displayName: config.displayName
		};
	});
};

export const CanteenSidebar = ({ categories, channel, onCategorySelect }: CanteenSidebarProps) => {
	const orderedCategories = createOrderedCategories(categories);

	const handleCategoryClick = (slug: string) => {
		onCategorySelect?.(slug);
		const element = document.getElementById(slug);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	return (
		<aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-24 overflow-y-auto border-r border-neutral-200 bg-neutral-50 py-4 z-10">
			<nav className="flex flex-col gap-3 px-2">
				{orderedCategories.map((category) => {
					const Icon = getCategoryIcon(category.displayName);
					return (
						<button
							key={category.slug}
							onClick={() => handleCategoryClick(category.slug)}
							className="group flex flex-col items-center gap-1 rounded-md px-1 py-2 transition-all hover:bg-neutral-200"
							title={category.displayName}
						>
							<Icon className="h-5 w-5 text-neutral-700 transition-colors group-hover:text-neutral-900" />
							<span className="text-[10px] text-center text-neutral-600 leading-tight group-hover:text-neutral-800 max-w-full break-words">
								{category.displayName.replace('/', ' ')}
							</span>
						</button>
					);
				})}
			</nav>
		</aside>
	);
};
