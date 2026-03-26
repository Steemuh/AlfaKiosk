import { notFound } from "next/navigation";
import { ProductListByCategoryDocument } from "@saleor/shared/gql/graphql";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { ProductList } from "@saleor/shared/ui/components/ProductList";
import { BackButton } from "@saleor/shared/ui/components/BackButton";

export default async function Page(props: { params: Promise<{ slug: string; channel: string }> }) {
	const params = await props.params;
	const { category } = await executeGraphQL(ProductListByCategoryDocument, {
		variables: { slug: params.slug, channel: params.channel },
		revalidate: 60,
	});

	if (!category || !category.products) {
		notFound();
	}

	const { name, products } = category;

	return (
		<div className="mx-auto max-w-7xl p-8 pb-16">
			<BackButton />
			<h1 className="pb-8 text-xl font-semibold">{name}</h1>
			<ProductList products={products.edges.map((e) => e.node)} channel={params.channel} />
		</div>
	);
}
