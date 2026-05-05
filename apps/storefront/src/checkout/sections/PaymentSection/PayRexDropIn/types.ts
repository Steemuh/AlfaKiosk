/**
 * PayRex Payment Gateway Types
 */

export const payRexGatewayId = "payrex-gateway";
export type PayRexGatewayId = typeof payRexGatewayId;

export interface PayRexGatewayInitializePayload {
	// Add any PayRex-specific initialization data here if needed
	// For now, this is a simple payment gateway
	[key: string]: any;
}

export type PayRexPaymentStatus = "succeeded" | "failed" | "pending" | "expired";

export interface PayRexCheckoutResponse {
	success: boolean;
	checkoutUrl?: string;
	sessionId?: string;
	error?: string;
	details?: string;
}

export interface PayRexWebhookPayload {
	type: string;
	data: {
		id: string;
		status: string;
		reference?: string;
		amount?: number;
		currency?: string;
		metadata?: Record<string, any>;
		[key: string]: any;
	};
	timestamp?: number;
}
