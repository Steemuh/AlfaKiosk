import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { executeGraphQL } from "@/lib/graphql";
import { CategoriesListDocument } from "@/gql/graphql";

export const CategorySelector = async () => {
	const { categories } = await executeGraphQL(CategoriesListDocument, {
		variables: { first: 100 },
		revalidate: 60,
	});

	const categoryList = [
		{ name: "All", slug: "all" },
		...(categories?.edges?.map(({ node }) => ({ name: node.name, slug: node.slug })) || []),
	];

	return (
		<div className="w-full bg-white px-3 py-4 sm:hidden">
			<p className="mb-3 text-sm font-semibold text-neutral-900">Categories</p>
			<div className="flex flex-wrap gap-2">
				{categoryList.map((category) => (
					<LinkWithChannel
						key={category.slug}
						href={category.slug === "all" ? "/products" : `/categories/${category.slug}`}
						className="inline-block rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white"
					>
						{category.name}
					</LinkWithChannel>
				))}
			</div>
		</div>
	);
};
