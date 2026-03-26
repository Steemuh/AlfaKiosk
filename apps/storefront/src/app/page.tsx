import { redirect } from "next/navigation";
import { DefaultChannelSlug } from "./config";

export default function HomePage() {
	redirect(`/${encodeURIComponent(DefaultChannelSlug)}`);
}
