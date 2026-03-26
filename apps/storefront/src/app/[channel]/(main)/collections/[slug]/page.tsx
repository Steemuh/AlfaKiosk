import { notFound } from "next/navigation";
import { ProductListByCollectionDocument } from "@saleor/shared/gql/graphql";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { ProductList } from "@saleor/shared/ui/components/ProductList";

export default async function Page(props: { params: Promise<{ slug: string; channel: string }> }) {
	const params = await props.params;
	const { collection } = await executeGraphQL(ProductListByCollectionDocument, {
		variables: { slug: params.slug, channel: params.channel },
		revalidate: 60,
	});

	if (!collection || !collection.products) {
		notFound();
	}

	const { name, products } = collection;

	return (
		<div className="mx-auto max-w-7xl p-8 pb-16">
			<h1 className="pb-8 text-xl font-semibold">{name}</h1>
			<ProductList products={products.edges.map((e) => e.node)} channel={params.channel} />
		</div>
	);
}
