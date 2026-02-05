"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMobileMenu } from "./useMobileMenu";

interface Category {
	name: string;
	slug: string;
}

interface MobileCategoriesProps {
	channel: string;
}

export const MobileCategories = ({ channel }: MobileCategoriesProps) => {
	const [categories, setCategories] = useState<Category[]>([
		{ name: "All", slug: "all" },
	]);
	const { closeMenu } = useMobileMenu();
	const router = useRouter();

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch(process.env.NEXT_PUBLIC_SALEOR_API_URL || "", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						query: `
							query {
								categories(first: 100) {
									edges {
										node {
											id
											name
											slug
										}
									}
								}
							}
						`,
					}),
				});
				const { data } = (await response.json()) as {
				data: {
					categories?: {
						edges?: Array<{ node: Category }>;
					};
				};
			};
				const categoryList: Category[] = [
					{ name: "All", slug: "all" },
					...(data?.categories?.edges?.map(({ node }: { node: Category }) => ({
						name: node.name,
						slug: node.slug,
					})) || []),
				];
				setCategories(categoryList);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};

		fetchCategories();
	}, []);

	const handleCategoryClick = (slug: string) => {
		closeMenu();
		if (slug === "all") {
			router.push(`/${channel}/products`);
		} else {
			router.push(`/${channel}/categories/${slug}`);
		}
	};

	return (
		<div className="border-b border-neutral-200 py-4 px-3">
			<p className="mb-3 text-xs font-semibold uppercase text-neutral-600">Categories</p>
			<div className="flex flex-wrap gap-2">
				{categories.map((category) => (
					<button
						key={category.slug}
						onClick={() => handleCategoryClick(category.slug)}
						className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white"
					>
						{category.name}
					</button>
				))}
			</div>
		</div>
	);
};
