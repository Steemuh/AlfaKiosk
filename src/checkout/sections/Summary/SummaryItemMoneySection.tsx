import { type OrderLineFragment } from "@/checkout/graphql";
import { SummaryItemMoneyInfo } from "@/checkout/sections/Summary/SummaryItemMoneyInfo";

interface LineItemQuantitySelectorProps {
	line: OrderLineFragment;
}

/**
 * Read-only quantity display for checkout view
 * Quantities are not editable during checkout - only in the cart
 */
export const SummaryItemMoneySection: React.FC<LineItemQuantitySelectorProps> = ({ line }) => {
	return (
		<div className="flex flex-col items-end gap-2">
			<div className="min-h-12 min-w-16 flex items-center justify-center rounded border-2 border-neutral-200 bg-neutral-100 px-3 py-2">
				<span className="text-lg font-bold text-neutral-700">Qty: {line.quantity}</span>
			</div>
			<SummaryItemMoneyInfo {...line} undiscountedUnitPrice={line.undiscountedUnitPrice.gross} />
		</div>
	);
};
