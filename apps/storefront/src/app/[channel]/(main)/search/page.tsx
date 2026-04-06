import { notFound } from "next/navigation";
import { OrderDirection, ProductOrderField, SearchProductsDocument } from "@saleor/shared/gql/graphql";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { Pagination } from "@saleor/shared/ui/components/Pagination";
import { ProductList } from "@saleor/shared/ui/components/ProductList";
import { getPaginatedListVariables } from "@saleor/shared/lib/utils";

export const metadata = {
	title: "Search products · Alfamart Food Kiosk",
	description: "Search products in Alfamart Food Kiosk",
};

export default async function Page(props: {
	searchParams: Promise<Record<"query" | "cursor" | "direction", string | string[] | undefined>>;
	params: Promise<{ channel: string }>;
}) {
	const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
	const searchValue = typeof searchParams.query === "string" ? searchParams.query : "";

	const paginationVariables = getPaginatedListVariables({ params: searchParams });

	const { products } = await executeGraphQL(SearchProductsDocument, {
		variables: {
			search: searchValue,
			channel: params.channel,
			sortBy: ProductOrderField.Name, sortDirection: OrderDirection.Asc,
			// { field: ProductOrderField.Name, direction: OrderDirection.Asc },
			...paginationVariables,
		},
		revalidate: 60,
	});

	if (!products) {
		notFound();
	}

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			{products.totalCount && products.totalCount > 0 ? (
				<div>
					<h1 className="pb-8 text-xl font-semibold">
						Search results for &quot;{searchValue}&quot;:
					</h1>
					<ProductList products={products.edges.map((e) => e.node)} channel={params.channel} />
					<Pagination pageInfo={products.pageInfo} />
				</div>
			) : (
				<h1 className="mx-auto pb-8 text-center text-xl font-semibold">Nothing found :(</h1>
			)}
		</section>
	);
}
