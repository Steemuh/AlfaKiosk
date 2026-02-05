import { ExternalProvider } from '../types.js';

type SaleorExternalAuthState = {
    loading: true;
    authURL?: undefined;
    error?: undefined;
} | {
    loading: false;
    authURL: string;
    error?: undefined;
} | {
    loading: false;
    authURL?: undefined;
    error: unknown;
};
declare const useSaleorExternalAuth: ({ saleorURL, provider, redirectURL, }: {
    saleorURL: string;
    provider: ExternalProvider;
    redirectURL: string;
}) => SaleorExternalAuthState;

export { type SaleorExternalAuthState, useSaleorExternalAuth };
