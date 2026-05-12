import { NextResponse } from "next/server";
import * as Checkout from "@saleor/shared/lib/checkout";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const channel = searchParams.get("channel") ?? "";

	if (!channel) {
		return NextResponse.json(
			{ ok: false, lineCount: 0, checkoutUrl: "/checkout" },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}

	const checkoutId = await Checkout.getIdFromCookies(channel);
	if (!checkoutId) {
		return NextResponse.json(
			{ ok: true, lineCount: 0, checkoutUrl: "/checkout" },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}

	const checkout = await Checkout.find(checkoutId);
	const lineCount = checkout?.lines?.reduce((result, line) => result + line.quantity, 0) ?? 0;
	const checkoutUrl = checkoutId ? `/checkout?checkout=${checkoutId}` : "/checkout";

	return NextResponse.json(
		{ ok: true, lineCount, checkoutUrl },
		{ status: 200, headers: { "Cache-Control": "no-store" } }
	);
}
