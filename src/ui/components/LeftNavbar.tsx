import { Suspense } from "react";
import { NavLinks } from "./nav/components/NavLinks";

export const LeftNavbar = ({ channel }: { channel: string }) => {
	return (
		<aside className="w-64 bg-neutral-100 min-h-screen p-4">
			<nav className="flex flex-col gap-4" aria-label="Main navigation">
				<h2 className="text-lg font-semibold mb-4">Navigation</h2>
				<ul className="flex flex-col gap-2">
					<NavLinks channel={channel} />
				</ul>
			</nav>
		</aside>
	);
};
