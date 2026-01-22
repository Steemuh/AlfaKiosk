import Link from "next/link";
import { invariant } from "ts-invariant";
import { RootWrapper } from "./pageWrapper";

export const metadata = {
	title: "Order · Alfamart Food Kiosk",
};

export default async function CheckoutPage(props: {
	searchParams: Promise<{ checkout?: string; order?: string }>;
}) {
	const searchParams = await props.searchParams;
	invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	// Allow checkout page to load even without URL parameters
	// The useCheckout hook will handle getting checkout from cookies

	return (
		<div className="min-h-dvh bg-white">
			<section className="mx-auto flex min-h-dvh max-w-7xl flex-col p-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center font-bold">
						<Link aria-label="homepage" href="/">
							Alfamart Food Kiosk
						</Link>
					</div>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
					>
						← Back to Menu
					</Link>
				</div>
				<h1 className="mt-8 text-3xl font-bold text-neutral-900">Complete Order</h1>

				<section className="mb-12 mt-6 flex-1">
					<RootWrapper saleorApiUrl={process.env.NEXT_PUBLIC_SALEOR_API_URL} />
				</section>
			</section>
		</div>
	);
}
