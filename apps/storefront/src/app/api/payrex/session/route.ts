import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const secretKey = process.env.PAYREX_SECRET_API_KEY || process.env.PAYREX_SECRET_KEY;
		if (!secretKey) {
			return NextResponse.json({ error: "Missing PayRex configuration" }, { status: 500 });
		}

		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get("sessionId") || searchParams.get("session_id");
		if (!sessionId) {
			return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
		}

		const payrexModule = await import("payrex-node");
		const createClient = typeof payrexModule.default === "function" ? payrexModule.default : payrexModule;
		const payrex = createClient(secretKey);

		const checkoutSessions = payrex.checkoutSessions || payrex.checkout_sessions;
		if (!checkoutSessions || typeof checkoutSessions.retrieve !== "function") {
			return NextResponse.json({ error: "PayRex SDK does not support session retrieval" }, { status: 500 });
		}

		const session = await checkoutSessions.retrieve(sessionId);
		return NextResponse.json({ success: true, session });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch PayRex session";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
