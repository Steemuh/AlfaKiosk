import { ProductElement } from "./ProductElement";
import { type ProductListItemFragment } from "@/gql/graphql";

export const ProductList = ({ products, channel }: { products: readonly ProductListItemFragment[]; channel: string }) => {
	return (
		<ul
			role="list"
			data-testid="ProductList"
			className="grid grid-cols-2 gap-4"
		>
			{products.map((product, index) => (
				<ProductElement
					key={product.id}
					product={product}
					priority={index < 2}
					loading={index < 3 ? "eager" : "lazy"}
					channel={channel}
				/>
			))}
		</ul>
	);
};
