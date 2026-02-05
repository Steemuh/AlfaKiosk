"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export const BackButton = () => {
	const router = useRouter();

	return (
		<button
			onClick={() => router.back()}
			className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
			aria-label="Go back"
		>
			<ChevronLeft className="h-5 w-5" />
			Back
		</button>
	);
};
