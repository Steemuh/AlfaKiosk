import { LinkWithChannel } from "../atoms/LinkWithChannel";

export function Footer({ channel }: { channel: string }) {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-neutral-300 bg-neutral-50">
			<div className="mx-auto max-w-7xl px-4 lg:px-8">
				<div className="flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
					<LinkWithChannel href="/pages/about" className="text-sm font-medium text-neutral-900 hover:text-neutral-600">
						About
					</LinkWithChannel>
					<p className="text-sm text-neutral-500">Copyright &copy; {currentYear} Alfamart Trading INC.</p>
				</div>
			</div>
		</footer>
	);
}
