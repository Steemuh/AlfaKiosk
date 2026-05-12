"use client";

export default function ProductError({ error }: { error: Error }) {
	return (
		<div className="mx-auto w-full max-w-3xl px-6 py-10">
			<div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
				<h1 className="text-lg font-semibold">Unable to load product</h1>
				<p className="mt-2 text-sm">{error.message || "Please try again later."}</p>
			</div>
		</div>
	);
}
