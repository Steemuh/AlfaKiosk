"use client";
import { ArrowRightIcon } from "lucide-react";

interface ProceedButtonProps {
	disabled?: boolean;
	onClick?: () => void;
}

export const ProceedButton = ({ disabled = false, onClick }: ProceedButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="mt-6 w-full rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400 sm:mt-8"
			aria-label="Proceed to payment"
		>
			<div className="flex items-center justify-center gap-2">
				<span>Proceed to Payment</span>
				<ArrowRightIcon className="h-4 w-4" />
			</div>
		</button>
	);
};
