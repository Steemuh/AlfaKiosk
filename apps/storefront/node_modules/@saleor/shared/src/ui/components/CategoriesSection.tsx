"use client";

import { useRouter } from "next/navigation";

interface Category {
	name: string;
	slug: string;
}

interface CategoriesSectionProps {
	categories: Category[];
	channel: string;
}

export const CategoriesSection = ({ categories, channel }: CategoriesSectionProps) => {
	const router = useRouter();

	const handleCategoryClick = (slug: string) => {
		router.push(`/${channel}/categories/${slug}`);
	};

	if (!categories || categories.length === 0) {
		return null;
	}

	return (
		<section className="mx-auto max-w-7xl px-8 py-6">
			<h2 className="mb-4 text-lg font-semibold text-neutral-900">Browse Categories</h2>
			<div className="flex flex-wrap gap-3">
				{categories.map((category) => (
					<button
						key={category.slug}
						onClick={() => handleCategoryClick(category.slug)}
						className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
					>
						{category.name}
					</button>
				))}
			</div>
		</section>
	);
};
