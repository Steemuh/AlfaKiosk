export const adyenGatewayId = "app.saleor.adyen";
export type AdyenGatewayId = typeof adyenGatewayId;

export type AdyenResultCode =
	| "Authorised"
	| "Error"
	| "Pending"
	| "PresentToShopper"
	| "Refused"
	| "Received";

export type CardElementData = {
	paymentMethod?: {
		type?: string;
		encryptedCardNumber?: string;
		encryptedExpiryMonth?: string;
		encryptedExpiryYear?: string;
		encryptedSecurityCode?: string;
		holderName?: string;
		[key: string]: unknown;
	};
	browserInfo?: Record<string, unknown>;
	billingAddress?: Record<string, unknown>;
	origin?: string;
	[key: string]: unknown;
};

export type DropinStatus = "ready" | "loading" | "error" | "success";

export type DropinElement = {
	submit?: () => void;
	unmount?: () => void;
	handleAction?: (action: unknown) => void;
	setStatus?: (
		status: DropinStatus | string,
		options?: {
			message?: string;
			[key: string]: unknown;
		}
	) => void;
	isValid?: boolean;
	[key: string]: any;
};

export type PaymentMethodsResponse = {
	paymentMethods?: Array<Record<string, unknown>>;
	storedPaymentMethods?: Array<Record<string, unknown>>;
	[key: string]: unknown;
};

export type PaymentResponse = {
	resultCode?: string;
	action?: Record<string, unknown>;
	order?: Record<string, unknown>;
	donationToken?: string;
	refusalReason?: string;
	refusalReasonCode?: string;
	[key: string]: unknown;
};

export type CoreOptions = {
	clientKey?: string;
	environment?: string;
	locale?: string;
	analytics?: {
		enabled?: boolean;
	};
	paymentMethodsResponse?: PaymentMethodsResponse;
	onSubmit?: (state: AdyenCheckoutInstanceState, component: DropinElement) => Promise<void> | void;
	onAdditionalDetails?: (state: AdyenCheckoutInstanceState, component: DropinElement) => Promise<void> | void;
	onError?: (error: unknown, component?: DropinElement) => void;
	[key: string]: unknown;
};

export interface AdyenGatewayInitializePayload {
	paymentMethodsResponse: Record<string, unknown>;
	clientKey: string;
	environment: string;
}

export interface AdyenPaymentResponse extends Omit<PaymentResponse, "resultCode"> {
	resultCode: AdyenResultCode;
	refusalReason?: string;
}

export interface AdyenTransactionInitializeResponse {
	paymentResponse: AdyenPaymentResponse;
}

export interface AdyenTransactionProcessResponse {
	paymentDetailsResponse: AdyenPaymentResponse;
}

export type ApplePayCallback = <T>(value: T) => void;

export type AdyenCheckoutInstanceState = {
	isValid?: boolean;
	data: CardElementData & Record<string, any>;
};

export type AdyenCheckoutInstanceOnSubmit = (
	state: AdyenCheckoutInstanceState,
	component: DropinElement,
) => Promise<void> | void;

export type AdyenCheckoutInstanceOnAdditionalDetails = (
	state: AdyenCheckoutInstanceState,
	component: DropinElement,
) => Promise<void> | void;