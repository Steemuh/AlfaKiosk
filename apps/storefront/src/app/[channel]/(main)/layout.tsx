import { type ReactNode } from "react";

export default function MainLayout(props: { children: ReactNode }) {
	const { children } = props;
	return <div className="min-h-dvh">{children}</div>;
}
