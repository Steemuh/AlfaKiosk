import { NextResponse } from 'next/server';

// Store the status in memory (in production, this would be in a database)
let storeStatus = {
	isOpen: true,
	lastUpdated: Date.now(),
	closedAt: undefined as number | undefined,
	closureReason: '',
};

export async function GET() {
	return NextResponse.json(storeStatus);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { isOpen, reason } = body;

		storeStatus = {
			isOpen,
			lastUpdated: Date.now(),
			closedAt: !isOpen ? Date.now() : undefined,
			closureReason: reason || '',
		};

		return NextResponse.json({
			success: true,
			status: storeStatus,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: 'Failed to update store status' },
			{ status: 500 }
		);
	}
}
