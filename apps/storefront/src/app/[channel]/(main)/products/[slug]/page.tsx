import Link from "next/link";
import { notFound } from "next/navigation";
import { executeGraphQL } from "@saleor/shared/lib/graphql";
import { ProductDetailsDocument } from "@saleor/shared/gql/graphql";
import { ProductImageWrapper } from "@saleor/shared/ui/atoms/ProductImageWrapper";
import { ProductDetailActions } from "@/components/ProductDetailActions";

export default async function ProductPage(props: {
	params: Promise<{ channel: string; slug: string }>;
}) {
	const { channel, slug } = await props.params;

	const { product } = await executeGraphQL(ProductDetailsDocument, {
		variables: { channel, slug },
		revalidate: 60,
	});

	if (!product) {
		notFound();
	}

	const price = product.pricing?.priceRange?.start?.gross?.amount ?? 0;
	const description = formatDescription(product.description);
	// Find the first variant with available quantity
	const firstAvailableVariant = product.variants?.find(
		(v) => v.quantityAvailable && v.quantityAvailable > 0
	);
	// Only use variant if it has stock, otherwise use null (out of stock)
	const firstVariantId = firstAvailableVariant?.id ?? null;

	// Debug logging for server
	console.log(`[ProductPage] ${product.name}:`, {
		firstAvailableVariant: firstAvailableVariant ? { id: firstAvailableVariant.id, name: firstAvailableVariant.name, qty: firstAvailableVariant.quantityAvailable } : "NONE AVAILABLE",
		allVariants: product.variants?.map((v) => ({
			id: v.id,
			name: v.name,
			quantityAvailable: v.quantityAvailable,
		})),
		selectedVariantId: firstVariantId,
	});

	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-6">
			<div className="mb-4 flex items-center justify-end">
				<Link
					href={`/${encodeURIComponent(channel)}`}
					className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
				>
					Back to Menu
				</Link>
			</div>
			<div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
				<div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
					{product.thumbnail?.url ? (
						<ProductImageWrapper
							loading="eager"
							src={product.thumbnail.url}
							alt={product.thumbnail.alt ?? product.name}
							width={1024}
							height={768}
							sizes="(max-width: 768px) 100vw, 768px"
						/>
					) : (
						<div className="flex h-full items-center justify-center text-sm text-neutral-500">
							No image available
						</div>
					)}
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900">{product.name}</h1>
						</div>
						<p className="text-xl font-semibold text-red-600">₱{price.toFixed(2)}</p>
					</div>

					{description ? (
						<p className="whitespace-pre-line text-sm text-neutral-700">{description}</p>
					) : (
						<p className="text-sm text-neutral-500">No description available.</p>
					)}

					<ProductDetailActions channel={channel} variantId={firstVariantId} />
				</div>
			</div>
		</div>
	);
}

function formatDescription(description: unknown) {
	if (!description) {
		return "";
	}
	if (typeof description === "string") {
		const trimmed = description.trim();
		if (!trimmed) {
			return "";
		}
		try {
			const parsed = JSON.parse(trimmed);
			return extractPlainText(parsed);
		} catch {
			return trimmed;
		}
	}
	return extractPlainText(description);
}

function extractPlainText(input: unknown): string {
	if (input == null) {
		return "";
	}
	if (typeof input === "string") {
		return input.trim();
	}
	if (Array.isArray(input)) {
		return input.map((entry) => extractPlainText(entry)).filter(Boolean).join("\n");
	}
	if (typeof input === "object") {
		const node = input as Record<string, unknown>;
		if (Array.isArray(node.blocks)) {
			return node.blocks
				.map((block) => {
					const blockData = (block as Record<string, unknown>).data as Record<string, unknown> | undefined;
					const textValue = blockData?.text;
					return typeof textValue === "string" ? textValue : extractPlainText(blockData);
				})
				.filter(Boolean)
				.join("\n");
		}

		return Object.entries(node)
			.filter(([key]) => !["time", "type", "version"].includes(key))
			.map(([, value]) => extractPlainText(value))
			.filter(Boolean)
			.join("\n");
	}
	return "";
}
