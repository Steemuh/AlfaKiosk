"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export const PaymentFailedClient = () => {
	const searchParams = useSearchParams();
	const [reason, setReason] = useState<string | null>(null);

	useEffect(() => {
		setReason(searchParams.get("reason"));
		sessionStorage.setItem("payrexPaymentStatus", "failed");
		sessionStorage.removeItem("payrexReturnToCheckout");
		sessionStorage.removeItem("payrexSessionId");
		sessionStorage.removeItem("payrexPaymentId");
		sessionStorage.removeItem("payrexCustomerName");
		sessionStorage.removeItem("payrexCustomerEmail");
		sessionStorage.removeItem("payrexPaidAt");
		sessionStorage.removeItem("payrexPendingOrder");
	}, [searchParams]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="mb-6 flex justify-center">
						<div className="rounded-full bg-red-100 p-4">
							<svg
								className="h-12 w-12 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
					<p className="text-gray-600 text-lg mb-6">
						Unfortunately, your payment could not be processed.
					</p>

					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
						<p className="text-sm font-semibold text-red-900 mb-3">What happened:</p>
						<ul className="text-sm text-red-800 space-y-2">
							<li>• Payment was declined or cancelled</li>
							<li>• Please check your payment method</li>
							<li>• Ensure you have sufficient funds or credit</li>
							{reason && (
								<li>
									<span className="text-xs text-red-700">Reason: {decodeURIComponent(reason)}</span>
								</li>
							)}
						</ul>
					</div>

					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
						<p className="text-sm text-yellow-900">
							<strong>Important:</strong> Your order was NOT created. Please try again with a different payment method.
						</p>
					</div>

					<div className="space-y-3">
						<Link
							href="/checkout"
							className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
						>
							Try Again
						</Link>
						<Link
							href="/"
							className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
						>
							Go to Home
						</Link>
					</div>

					<p className="text-xs text-gray-500 mt-6">
						If the problem persists, please contact our support team at{" "}
						<a href="mailto:support@example.com" className="text-blue-600 hover:underline">
							support@example.com
						</a>
					</p>
				</div>

				<div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
					<p className="text-sm font-semibold text-gray-900 mb-3">Troubleshooting:</p>
					<ul className="text-sm text-gray-600 space-y-2">
						<li>• Check your internet connection</li>
						<li>• Try a different payment method</li>
						<li>• Contact your bank if the issue persists</li>
						<li>• Clear your browser cache and try again</li>
					</ul>
				</div>
			</div>
		</div>
	);
};
