import { type ReactNode } from "react";
import { Header } from "@saleor/shared/ui/components/Header";
import { BottomNavBar } from "@/components/BottomNavBar";

export default async function ChannelLayout(props: {
	children: ReactNode;
	params: Promise<{ channel: string }>;
}) {
	const { children, params } = props;
	const { channel } = await params;

	return (
		<div className="min-h-dvh bg-white">
			<Header />
			<div className="flex min-h-dvh flex-col pt-20 pb-20">
				<main className="flex-1">{children}</main>
			</div>
			<BottomNavBar channel={channel} />
		</div>
	);
}
