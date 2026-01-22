import { type CheckoutLineFragment } from "@/checkout/graphql";
import { Skeleton } from "@/checkout/components";
import { SummaryItemMoneyInfo } from "@/checkout/sections/Summary/SummaryItemMoneyInfo";
import { QuantitySelector } from "@/checkout/sections/Summary/QuantitySelector";
import { useSummaryItemForm } from "@/checkout/sections/Summary/useSummaryItemForm";

interface SummaryItemMoneyEditableSectionProps {
	line: CheckoutLineFragment;
}

export const SummaryItemMoneyEditableSection: React.FC<SummaryItemMoneyEditableSectionProps> = ({ line }) => {
	const { increaseQuantity, decreaseQuantity, isQuantityUpdating } = useSummaryItemForm({ line });
	const productName = line.variant?.product?.name || line.variant?.name || "this item";

	return (
		<div className="flex flex-col items-end gap-2">
			<QuantitySelector
				quantity={line.quantity}
				onIncrease={increaseQuantity}
				onDecrease={decreaseQuantity}
				isLoading={isQuantityUpdating}
				disabled={isQuantityUpdating}
				productName={productName}
			/>
			{isQuantityUpdating ? (
				<div className="flex max-w-[6ch] flex-col gap-1">
					<Skeleton />
					<Skeleton />
				</div>
			) : (
				<SummaryItemMoneyInfo {...line} />
			)}
		</div>
	);
};
