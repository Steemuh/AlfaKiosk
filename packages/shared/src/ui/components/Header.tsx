import { Suspense } from "react";
import { Logo } from "./Logo";
import { CartNavItem } from "./nav/components/CartNavItem";

export function Header({ channel }: { channel: string }) {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-neutral-100 shadow-sm">
			<div className="flex h-20 items-center justify-between px-6 w-full">
				<div>
					<Logo />
				</div>
				<div>
					<Suspense fallback={<div className="w-6" />}>
						<CartNavItem channel={channel} />
					</Suspense>
				</div>
			</div>
		</header>
	);
}
