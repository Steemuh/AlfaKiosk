import { Logo } from "./Logo";

export function Header() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-neutral-100 shadow-sm">
			<div className="flex h-20 items-center px-6 w-full">
				<div>
					<Logo />
				</div>
			</div>
		</header>
	);
}
