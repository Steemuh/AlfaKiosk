import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { invariant } from "ts-invariant";
import { RootWrapper } from "./pageWrapper";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CheckoutBottomNav } from "@/components/CheckoutBottomNav";

export const metadata = {
	title: "Order · Alfamart Food Kiosk",
};

export default async function CheckoutPage() {
	invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	return (
		<PullToRefresh>
			<div className="min-h-dvh bg-white pb-20">
				<section className="mx-auto flex min-h-dvh max-w-7xl flex-col p-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center font-bold">
							<Link aria-label="homepage" href="/">
								Alfamart Food Kiosk
							</Link>
						</div>
						<Link
							href="/"
							className="inline-flex items-center justify-center rounded-full p-4 text-blue-600 hover:bg-blue-50"
							aria-label="Back to Menu"
						>
							<ArrowLeft className="h-8 w-8" />
						</Link>
					</div>
					<h1 className="mt-8 text-3xl font-bold text-neutral-900">Complete Order</h1>

					<section className="mb-12 mt-6 flex-1">
						<RootWrapper saleorApiUrl={process.env.NEXT_PUBLIC_SALEOR_API_URL} />
					</section>
				</section>
				<CheckoutBottomNav />
			</div>
		</PullToRefresh>
	);
}
