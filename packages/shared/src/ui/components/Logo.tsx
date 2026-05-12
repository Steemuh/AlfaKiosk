"use client";

import { usePathname } from "next/navigation";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

const companyName = "ALFA-C";

export const Logo = () => {
	const pathname = usePathname();

	if (pathname === "/") {
		return (
			<h1 className="flex items-center text-2xl font-bold tracking-wide whitespace-nowrap text-white" aria-label="homepage">
				{companyName}
			</h1>
		);
	}
	return (
		<div className="flex items-center text-2xl font-bold tracking-wide whitespace-nowrap text-white">
			<LinkWithChannel aria-label="homepage" href="/">
				{companyName}
			</LinkWithChannel>
		</div>
	);
};
