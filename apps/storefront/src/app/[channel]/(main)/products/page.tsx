import { notFound } from "next/navigation";
import { ProductListPaginatedDocument, OrderDirection, ProductOrderField } from "@saleor/shared/gql/graphql";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { Pagination } from "@saleor/shared/ui/components/Pagination";
import { ProductList } from "@saleor/shared/ui/components/ProductList";
import { CategorySelector } from "@saleor/shared/ui/components/CategorySelector";
import { SortBy } from "@saleor/shared/ui/components/SortBy";
import { getPaginatedListVariables } from "@saleor/shared/lib/utils";

export const metadata = {
	title: "Products · Alfamart Food Kiosk",
	description: "All products available in the kiosk",
};

const getSortVariables = (sortParam?: string | string[]) => {
	const sortValue = Array.isArray(sortParam) ? sortParam[0] : sortParam;

	switch (sortValue) {
		case "price-asc":
			return { field: ProductOrderField.MinimalPrice, direction: OrderDirection.Asc };
		case "price-desc":
			return { field: ProductOrderField.MinimalPrice, direction: OrderDirection.Desc };
		case "name-desc":
			return { field: ProductOrderField.Name, direction: OrderDirection.Desc };
		default:
			return { field: ProductOrderField.Name, direction: OrderDirection.Asc };
	}
};

export default async function Page(props: {
	params: Promise<{ channel: string }>;
	searchParams: Promise<{
		cursor?: string | string[];
		direction?: string | string[];
		sort?: string | string[];
	}>;
}) {
	const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
	const { channel } = params;

	const paginationVariables = getPaginatedListVariables({ params: searchParams });
	const sortVariables = getSortVariables(searchParams.sort);

	const { products } = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			...paginationVariables,
			channel,
			sortBy: sortVariables,
		},
		revalidate: 60,
	});

	if (!products) {
		notFound();
	}

	return (
		<>
			<CategorySelector />
			<section className="mx-auto max-w-7xl p-8 pb-16">
				<div className="mb-6 flex justify-end">
					<SortBy />
				</div>
				<h2 className="sr-only">Product list</h2>
				<ProductList products={products.edges.map((edge) => edge.node)} channel={channel} />
				<Pagination pageInfo={products.pageInfo} />
			</section>
		</>
	);
}
